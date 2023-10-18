import fs from "fs"
import path from "path"
import { v4 as uuidv4 } from "uuid"

export const saveImage = (base64Image: string): string => {
  const imagePath = path.join(process.cwd(), "public", "shows", "images")
  const fileName = `${uuidv4()}.png`

  if (!fs.existsSync(imagePath)) {
    fs.mkdirSync(imagePath, { recursive: true })
  }

  const dataUrlRegex = /^data:image\/(\w+);base64,/
  const matches = base64Image.match(dataUrlRegex)
  const base64Data = matches ? base64Image.replace(matches[0], "") : ""

  fs.writeFileSync(path.join(imagePath, fileName), base64Data, {
    encoding: "base64",
  })

  return `/shows/images/${fileName}`
}
