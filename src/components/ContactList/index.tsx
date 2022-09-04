import React, { useState, useEffect, useRef } from 'react'
import { ContactItem } from '../ContactItem'
import { Loading } from '../Loading'

const type = 'character'
const currentPage = 1
const apiPath = `https://rickandmortyapi.com/api/${type}?page=${currentPage}`

interface searchInputType {
  [name: string]: string
  status: string
  gender: string
}

export const ContactList: React.FC<{}> = () => {
  const [contactList, SetContactList] = useState([] as any[])
  const [searchInput, SetSearchInput] = useState({
    name: '',
    status: '',
    gender: '',
  } as searchInputType)
  const [isLoading, SetIsloading] = useState(false)

  //  contact list by fetching
  const contactListRef = useRef<null | any[]>(null)

  const onSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    SetSearchInput((preInut) => {
      return {
        ...preInut,
        [event.target.name]: event.target.value,
      }
    })
  }

  const onCleanFilter = () => {
    SetSearchInput((preInput) => {
      return {
        ...preInput,
        status: '',
        gender: '',
      }
    })
  }

  //  fetch data
  useEffect(() => {
    const fetchContactList = async () => {
      let result = [] as any[]

      try {
        SetIsloading(true)

        const response = await fetch(apiPath)
        const data = await response.json()

        if (
          response.status < 400 &&
          response.ok &&
          data.hasOwnProperty('results')
        ) {
          result = data.results
        }
      } catch (e) {
        alert('something error...')

        console.log(e)
      } finally {
        SetContactList(result)
        contactListRef.current = result

        SetIsloading(false)
      }
    }

    //  call api
    fetchContactList()
  }, [])

  //  Change contact list in every search
  useEffect(() => {
    if (!contactListRef.current || contactListRef.current.length === 0) return

    const getFormatedObject = (object: searchInputType) => {
      const formatString = (value: string) => {
        return value.toLowerCase().replaceAll(' ', '')
      }

      let instance = { ...object }

      for (const prop in instance) {
        instance = {
          ...instance,
          [prop]: formatString(instance[prop]),
        }
      }

      return instance
    }

    const contactListInstance = [...contactListRef.current]

    //  format search input object
    const { name: sName, status: sStatus, gender: sGender } = getFormatedObject(
      searchInput,
    )

    const filteredContactList = contactListInstance.filter(
      ({ name, status, gender }) => {
        //  format data instance object
        const {
          name: oName,
          status: oStatus,
          gender: oGender,
        } = getFormatedObject({ name, status, gender })

        return (
          oName.includes(sName) &&
          oStatus.includes(sStatus) &&
          oGender.includes(sGender)
        )
      },
    )

    SetContactList(filteredContactList)
  }, [searchInput])

  return (
    <>
      <div className="component-contact-list w-full bg-sky-500 overflow-auto">
        <div className="p-6">
          <h1 className="mb-4 font-bold text-xl">Contact</h1>

          <input
            type="text"
            className="p-1 mb-5 rounded-md w-full text-sky-500"
            placeholder="Saerch Characters"
            value={searchInput.name}
            onChange={onSearchChange}
            name="name"
          />
          <select
            name="status"
            className="mr-2"
            onChange={onSearchChange}
            value={searchInput.status}
          >
            <option value="">select an option</option>
            <option value="alive">Alive</option>
            <option value="dead">Dead</option>
            <option value="unknown">Unknown</option>
          </select>

          <select
            name="gender"
            className="mr-2"
            onChange={onSearchChange}
            value={searchInput.gender}
          >
            <option value="">select an option</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="genderless">Genderless</option>
            <option value="unknown">Unknown</option>
          </select>

          {(searchInput.status || searchInput.gender) && (
            <button
              className="p-1 rounded-lg bg-red-500"
              onClick={onCleanFilter}
            >
              Clean Filter
            </button>
          )}
        </div>

        {isLoading && <Loading />}

        {contactList && contactList.length !== 0 && (
          <div className="grid gap-7 p-5">
            {contactList.map((contact, index) => {
              return (
                <React.Fragment key={index}>
                  <ContactItem contact={contact} type="link" />
                </React.Fragment>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
