import { NextApiRequest, NextApiResponse } from "next"
import { Writable, pipeline } from "stream"
import { promisify } from "util"
import fs from "fs"
import path from "path"

export const config = {
  api: {
    bodyParser: false,
  },
}

const pipelineAsync = promisify(pipeline)

const writeStreamAsync = async (
  stream: NodeJS.ReadableStream,
  filePath: string
): Promise<void> => {
  await pipelineAsync(stream, fs.createWriteStream(filePath))
}

const parseBoundary = (contentType: string): string => {
  const regex = /boundary=([^;]+)/
  const match = contentType.match(regex)
  return match ? match[1] : ""
}

const parseRequest = async (
  req: NextApiRequest
): Promise<NodeJS.ReadableStream> => {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    const writable = new Writable({
      write(chunk, encoding, callback) {
        chunks.push(chunk)
        callback()
      },
    })

    const boundary = parseBoundary(req.headers["content-type"] as string)
    const regex = new RegExp(
      `--${boundary}\\r\\nContent-Disposition: form-data; name="media"; filename=".+?"\\r\\nContent-Type: .+?\\r\\n\\r\\n`
    )

    req.on("data", (chunk) => {
      if (regex.test(chunk.toString())) {
        pipeline(
          chunk.slice(chunk.indexOf(Buffer.from("\r\n\r\n")) + 4),
          writable,
          (error) => {
            if (error) reject(error)
          }
        )
      }
    })

    req.on("end", () => {
      resolve(writable as unknown as NodeJS.ReadableStream)
    })

    req.on("error", (error) => {
      reject(error)
    })
  })
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      const uploadDir = "public/shows"
      const fileName = Date.now().toString()
      const filePath = path.join(uploadDir, fileName)

      const fileStream = await parseRequest(req)
      await writeStreamAsync(fileStream, filePath)

      res.status(200).json({ filePath })
    } catch (error) {
      console.error("Error:", error)
      res.status(500).json({ message: "Upload failed" })
    }
  } else {
    res.status(405).json({ message: "Method not allowed" })
  }
}
