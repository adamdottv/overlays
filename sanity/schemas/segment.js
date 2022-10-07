export default {
  name: "segment",
  title: "Segment",
  type: "document",
  fields: [
    {
      name: "title",
      title: "Title",
      type: "string",
    },
    {
      name: "image",
      title: "Image",
      type: "image",
      options: {
        hotspot: true,
      },
    },
    {
      name: "link",
      title: "Link",
      type: "url",
    },
    {
      name: "commentary",
      title: "Commentary",
      type: "array",
      of: [{ type: "block" }],
    },
  ],
}
