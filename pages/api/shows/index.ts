import { NextApiRequest, NextApiResponse } from "next"
import fs from "fs"
import path from "path"

const showsDirectory = path.join(process.cwd(), "./data/shows")

const getShowFilePath = (id: number): string => {
  return path.join(showsDirectory, `${id}.json`)
}

const readShowFile = (id: number): any => {
  const filePath = getShowFilePath(id)
  const fileContents = fs.readFileSync(filePath, "utf8")
  return JSON.parse(fileContents)
}

const writeShowFile = (id: number, data: any) => {
  const filePath = getShowFilePath(id)
  const fileContents = JSON.stringify(data)
  fs.writeFileSync(filePath, fileContents)
}

const deleteShowFile = (id: number) => {
  const filePath = getShowFilePath(id)
  fs.unlinkSync(filePath)
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req

  switch (method) {
    case "GET":
      const showIds = fs
        .readdirSync(showsDirectory)
        .map((fileName) => parseInt(fileName.split(".")[0]))
      const shows = showIds.map((id) => readShowFile(id))
      res.status(200).json(shows)
      break
    case "POST":
      const { name, date, script } = req.body
      const id = Date.now()
      const newShow = { id, name, date, script }
      writeShowFile(id, newShow)
      res.status(201).json(newShow)
      break
    case "PUT":
      const showToUpdate = req.body
      writeShowFile(showToUpdate.id, showToUpdate)
      res.status(200).json(showToUpdate)
      break
    case "DELETE":
      const { id: showIdToDelete } = req.query
      deleteShowFile(Number(showIdToDelete))
      res.status(200).json({ message: "Show deleted successfully." })
      break
    default:
      res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
