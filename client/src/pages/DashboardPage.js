import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import BookmarkCard from "../components/BookmarkCard";
import { useNavigate } from "react-router-dom";

const DashboardPage = () => {
  const { token, logout } = useContext(AuthContext);
  const [url, setUrl] = useState("");
  const [bookmarks, setBookmarks] = useState([]);
  const navigate = useNavigate();
  const fetchBookmarks = async () => {
    const res = await axios.get("http://localhost:3001/api/bookmarks", {
      headers: { Authorization: `Bearer ${token}` }
    });
    setBookmarks(res.data);
  };

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    const res = await axios.post("http://localhost:3001/api/bookmarks", { url }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setBookmarks([res.data, ...bookmarks]);
    setUrl("");
  };

  const handleDelete = async (id) => {
    await axios.delete(`http://localhost:3001/api/bookmarks/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setBookmarks(bookmarks.filter(b => b.id !== id));
  };

  return (
    <div>
      <button onClick={() => {logout(); navigate('/login')}}>Logout</button>
      <h2>Save Bookmark</h2>
      <form onSubmit={handleAdd}>
        <input value={url} onChange={e => setUrl(e.target.value)} placeholder="Paste URL" required />
        <button type="submit">Save</button>
      </form>
      <div>
        {bookmarks.map(b => (
          <BookmarkCard key={b.id} bookmark={b} onDelete={() => handleDelete(b.id)} />
        ))}
      </div>
    </div>
  );
};

export default DashboardPage;
