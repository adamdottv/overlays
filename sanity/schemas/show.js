export default {
  name: "show",
  title: "Show",
  type: "document",
  fields: [
    {
      name: "date",
      title: "Date",
      type: "date",
    },
    {
      name: "segments",
      title: "Segments",
      type: "array",
      of: [{ type: "segment" }],
    },
  ],
}
