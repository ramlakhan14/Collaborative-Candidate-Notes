import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import Input from "../components/ui/input";
import Button from "../components/ui/button";
import API from "../services/api";
import { socket } from "../services/socket";
import { toast } from "react-toastify";
import { Trash2 } from "lucide-react";

export default function CandidateNotes() {
  const { id: candidateId } = useParams();
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get("highlight");

  const [notes, setNotes] = useState([]);
  const [input, setInput] = useState("");
  const [users, setUsers] = useState([]);
  const [tagged, setTagged] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const endRef = useRef(null);

const token = localStorage.getItem("token");

let userId = null;
if (token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    userId = payload?.id || null;
  } catch (error) {
    console.error("Failed to decode JWT:", error.message);
    userId = null;
  }
}


  const scrollToBottom = () => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // ✅ useCallback for clean ESLint deps
  const fetchNotes = useCallback(async () => {
    try {
     if (!candidateId || candidateId === "undefined") {
  toast.error("Invalid candidate ID.");
  return;
}
      const res = await API.get(`/notes/candidate/${candidateId}`);
      setNotes(res.data);
    } catch (error) {
      console.error("❌ Error loading notes:", error.response?.data || error.message);
      toast.error("Failed to load notes.");
    }
  }, [candidateId]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const tagIds = tagged.map((u) => u._id);

    try {
      const res = await API.post("/notes", {
        candidateId,
        content: input,
        tags: tagIds,
      });

      setNotes((prev) => [...prev, res.data]);
      scrollToBottom();
      setInput("");
      setTagged([]);
      setSuggestions([]);
    } catch (err) {
      toast.error("Failed to send note.");
    }
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setInput(value);

    const match = value.match(/@(\w*)$/);
    if (match) {
      const keyword = match[1].toLowerCase();
      const filtered = users.filter((u) =>
        u.name.toLowerCase().startsWith(keyword)
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const handleSelectUser = (user) => {
    setTagged((prev) => [...prev.filter((u) => u._id !== user._id), user]);
    const updatedInput = input.replace(/@\w*$/, `@${user.name} `);
    setInput(updatedInput);
    setSuggestions([]);
  };

  const handleDelete = async (noteId) => {
    if (!window.confirm("Are you sure you want to delete this message?")) return;
    try {
      await API.delete(`/notes/${noteId}`);
      setNotes((prev) => prev.filter((n) => n._id !== noteId));
      toast.success("Note deleted");
    } catch (err) {
      toast.error("Failed to delete note");
    }
  };

  // ✅ Main setup
  useEffect(() => {
    if (!candidateId || !userId) return;

    socket.emit("join_room", candidateId);
    fetchNotes();
    API.get("/auth/users").then((res) => setUsers(res.data));

    socket.on("new_note", (note) => {
      setNotes((prev) => [...prev, note]);
      scrollToBottom();

      if (note.tags?.some((u) => u._id === userId)) {
        toast.info(`You were tagged by @${note.sender.name}`);
      }
    });

    return () => {
      socket.emit("leave_room", candidateId);
      socket.off("new_note");
    };
  }, [candidateId, userId, fetchNotes]);

  // ✅ Highlight & scroll to notification-triggered note
  useEffect(() => {
    if (highlightId && notes.length > 0) {
      const target = document.querySelector(`[data-id="${highlightId}"]`);
      if (target) {
        setTimeout(() => {
          target.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 100); // wait for render
      }
    }
  }, [highlightId, notes]);

  return (
    <div className="p-8 min-h-screen bg-gray-100">
      <h2 className="text-2xl font-bold mb-4">Candidate Notes</h2>

      {/* Notes List */}
      <div className="space-y-3 mb-6">
        {notes.map((n) => (
          <div
            key={n._id}
            data-id={n._id}
            className={`p-4 rounded-lg shadow-md border relative transition hover:shadow-lg bg-white ${
              n.sender?._id === userId ? "bg-blue-50" : "bg-white"
            } ${n._id === highlightId ? "border-2 border-yellow-400" : ""}`}
          >
            <div className="flex justify-between items-center">
              <p className="text-sm font-semibold text-gray-800">{n.sender?.name}</p>
              {n.sender?._id === userId && (
                <button
                  onClick={() => handleDelete(n._id)}
                  className="text-red-500 hover:text-red-700"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>

            <p className="mt-1">{n.content}</p>

            {n.tags?.length > 0 && (
              <p className="text-sm text-blue-600 mt-2">
                Tagged: {n.tags.map((u) => `@${u.name}`).join(", ")}
              </p>
            )}
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {/* Input & Suggestions */}
      <div className="relative">
        <Input
          placeholder="Write a message... use @ to tag"
          value={input}
          onChange={handleChange}
        />

        {suggestions.length > 0 && (
          <ul className="absolute z-10 bg-white border mt-1 w-full rounded shadow">
            {suggestions.map((user) => (
              <li
                key={user._id}
                className="px-3 py-1 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleSelectUser(user)}
              >
                @{user.name}
              </li>
            ))}
          </ul>
        )}

        <Button className="mt-3" onClick={handleSend}>
          Send
        </Button>
      </div>
    </div>
  );
}
