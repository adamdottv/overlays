import React, { useState, useCallback, useRef } from "react"
import { useDropzone } from "react-dropzone"

interface Annotation {
  start: number
  end: number
  text: string
  media: File
}

const MediaAnnotator: React.FC = () => {
  const [text, setText] = useState<string>("")
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [selected, setSelected] = useState<boolean>(false)
  const [previewAnnotation, setPreviewAnnotation] = useState<Annotation | null>(
    null
  )
  console.log(previewAnnotation)
  const [previewPosition, setPreviewPosition] = useState({ x: 0, y: 0 })

  const textAreaRef = useRef<HTMLTextAreaElement>(null)

  const handleSelectionChange = () => {
    const textarea = textAreaRef.current
    if (!textarea) return

    const { selectionStart, selectionEnd } = textarea
    setSelected(selectionStart !== selectionEnd)
  }

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const textarea = textAreaRef.current
      if (!textarea) return

      const { selectionStart, selectionEnd } = textarea
      const selectedText = textarea.value.slice(selectionStart, selectionEnd)

      if (selectionStart !== selectionEnd && acceptedFiles.length > 0) {
        const annotation: Annotation = {
          start: selectionStart,
          end: selectionEnd,
          text: selectedText,
          media: acceptedFiles[0],
        }
        setAnnotations([...annotations, annotation])
        setSelected(false)
      }
    },
    [annotations]
  )

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    noClick: true,
    noKeyboard: true,
    accept: { "image/*": [], "audio/*": [], "video/*": [] },
    maxFiles: 1,
    multiple: false,
  })

  const handleAnnotationMouseOver = (
    annotation: Annotation,
    event: React.MouseEvent
  ) => {
    const target = event.target as HTMLElement
    const rect = target.getBoundingClientRect()
    setPreviewAnnotation(annotation)
    setPreviewPosition({ x: rect.left, y: rect.top + rect.height })
  }

  const handleAnnotationMouseOut = () => {
    setPreviewAnnotation(null)
  }

  const renderAnnotatedText = (
    inputText: string,
    inputAnnotations: Annotation[]
  ) => {
    let lastIndex = 0
    const elements = []

    inputAnnotations.forEach((annotation) => {
      elements.push(
        <span key={`text-${annotation.start}`}>
          {inputText.slice(lastIndex, annotation.start)}
        </span>
      )
      elements.push(
        <span
          key={`annotation-${annotation.start}`}
          className="annotation cursor-pointer bg-yellow-300"
          onMouseOver={(e) => handleAnnotationMouseOver(annotation, e)}
          onMouseOut={handleAnnotationMouseOut}
        >
          {annotation.text}
        </span>
      )
      lastIndex = annotation.end
    })

    elements.push(
      <span key={`text-${inputText.length}`}>{inputText.slice(lastIndex)}</span>
    )

    return elements
  }

  const getPreviewContent = (annotation: Annotation | null) => {
    console.log(annotation)
    if (!annotation) return null

    const url = URL.createObjectURL(annotation.media)
    const mimeType = annotation.media.type

    if (mimeType.startsWith("image/")) {
      return <img src={url} alt="Preview" className="max-h-56 max-w-xs" />
    } else if (mimeType.startsWith("audio/")) {
      return <audio src={url} controls className="w-64" />
    } else if (mimeType.startsWith("video/")) {
      return (
        <video src={url} controls className="max-h-56 max-w-xs">
          Your browser does not support the video tag.
        </video>
      )
    }
    return null
  }

  return (
    <div className="relative">
      <div {...getRootProps()} className="border border-gray-300 p-2">
        <input {...getInputProps()} />
        {selected && (
          <div className="absolute top-0 right-0 mt-1 mr-1 rounded bg-blue-200 p-1">
            Drop media here
          </div>
        )}
        <textarea
          ref={textAreaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onSelect={handleSelectionChange}
          className="h-48 w-full resize-none"
        />
      </div>
      {previewAnnotation && (
        <div
          className="absolute z-10 mt-2 rounded border bg-white p-2 shadow-md"
          style={{ left: previewPosition.x, top: previewPosition.y }}
        >
          {getPreviewContent(previewAnnotation)}
        </div>
      )}
      <div className="">
        <div className="whitespace-pre-wrap">
          {renderAnnotatedText(text, annotations)}
        </div>
      </div>
    </div>
  )
}

export default MediaAnnotator
