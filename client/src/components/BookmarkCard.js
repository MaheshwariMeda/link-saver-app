import React from "react";

const BookmarkCard = ({ bookmark, onDelete }) => (
  <div style={{ border: "1px solid gray", margin: "10px", padding: "10px" }}>
    <a href={bookmark.url} target="_blank" rel="noreferrer">
      <img src={bookmark.favicon} alt="favicon" width="16" style={{ marginRight: "8px" }} />
      {bookmark.title}
    </a>
    <p>{bookmark.summary}</p>
    <button onClick={onDelete}>Delete</button>
  </div>
);

export default BookmarkCard;
