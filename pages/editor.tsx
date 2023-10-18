import React, { useState, ChangeEvent, FormEvent, useEffect } from "react"
import RichTextEditor from "../components/text-editor"

interface Show {
  id: number
  name: string
  date: string
  script: string
}

const Shows: React.FC = () => {
  const [shows, setShows] = useState<Show[]>([])
  const [selectedShow, setSelectedShow] = useState<Show | null>(null)
  const [name, setName] = useState<string>("")
  const [date, setDate] = useState<string>("")

  useEffect(() => {
    const fetchShows = async () => {
      const response = await fetch("/api/shows")
      const data = await response.json()
      setShows(data)
    }
    fetchShows()
  }, [])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    let updatedShow: Show
    if (selectedShow) {
      updatedShow = { ...selectedShow, name, date }
      await fetch(`/api/shows`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedShow),
      })
    } else {
      const response = await fetch(`/api/shows`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, date, script: "" }),
      })
      updatedShow = await response.json()
    }

    setShows(
      shows
        .map((show) => (show.id === updatedShow.id ? updatedShow : show))
        .concat(
          shows.find((show) => show.id === updatedShow.id) ? [] : [updatedShow]
        )
    )
    resetForm()
  }

  const resetForm = () => {
    setSelectedShow(null)
    setName("")
    setDate("")
  }

  const handleShowClick = (show: Show) => {
    setSelectedShow(show)
    setName(show.name)
    setDate(show.date)
  }

  const handleDelete = async (id: number) => {
    await fetch(`/api/shows?id=${id}`, { method: "DELETE" })
    setShows(shows.filter((show) => show.id !== id))
  }

  return (
    <div className="container mx-auto px-4">
      <h1 className="mb-4 text-2xl font-bold">Shows</h1>
      <form onSubmit={handleSubmit} className="mb-8">
        <label htmlFor="name" className="block">
          Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={name}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setName(e.target.value)
          }
          className="mb-4 w-full border border-gray-300 p-2"
          required
        />
        <label htmlFor="date" className="block">
          Date
        </label>
        <input
          type="date"
          id="date"
          name="date"
          value={date}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setDate(e.target.value)
          }
          className="mb-4 w-full border border-gray-300 p-2"
          required
        />
        <button
          type="submit"
          className="rounded bg-blue-500 px-4 py-2 text-white"
        >
          {selectedShow ? "Update" : "Add"} Show
        </button>
        {selectedShow && (
          <button
            type="button"
            onClick={resetForm}
            className="ml-4 rounded bg-gray-400 px-4 py-2 text-white"
          >
            Cancel
          </button>
        )}
      </form>
      <ul>
        {shows.map((show) => (
          <li key={show.id} className="mb-4">
            <div className="flex items-center justify-between">
              <div
                onClick={() => handleShowClick(show)}
                className="cursor-pointer"
              >
                <h2 className="text-xl font-semibold">{show.name}</h2>
                <p>{show.date}</p>
              </div>

              <button
                onClick={() => handleDelete(show.id)}
                className="rounded bg-red-500 px-4 py-2 text-white"
              >
                Delete
              </button>
            </div>
            {selectedShow && selectedShow.id === show.id && (
              <div className="mt-4">
                <h3 className="mb-2 text-lg font-bold">Script</h3>
                <RichTextEditor />
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Shows
