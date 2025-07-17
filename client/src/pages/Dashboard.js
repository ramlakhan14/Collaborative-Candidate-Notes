// pages/Dashboard.js
import { useEffect, useState } from "react";
import API from "../services/api";
import Button from "../components/ui/button";
import Input from "../components/ui/input";
import Card from "../components/ui/card";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function Dashboard() {
  const [candidates, setCandidates] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  const fetchCandidates = async () => {
    try {
      const res = await API.get("/candidates");
      setCandidates(res.data);
    } catch (error) {
      console.error("Error fetching candidates:", error.message);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await API.get("/notifications"); // User-specific tagged notifications
      setNotifications(res.data);
    } catch (error) {
      console.error("Error fetching notifications:", error.message);
    }
  };

  const handleAddCandidate = async () => {
    try {
      await API.post("/candidates", { name, email });
      setName("");
      setEmail("");
      fetchCandidates();
    } catch (error) {
      alert("Failed to add candidate.");
    }
  };

  useEffect(() => {
    fetchCandidates();
    fetchNotifications();
  }, []);

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="flex justify-between mb-6 flex-col lg:flex-row gap-6">
        {/* Candidates Section */}
        <div className="w-full lg:w-2/3">
          <h2 className="text-2xl font-bold mb-2">Candidate List</h2>
          <div className="flex gap-2 flex-wrap mb-4">
            <Input
              placeholder="Candidate name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button onClick={handleAddCandidate}>Add</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {candidates.length > 0 ? (
              candidates.map((c) => (
                <Card
                  key={c._id}
                  className="p-4 hover:shadow cursor-pointer"
                  onClick={() => navigate(`/candidate/${c._id}`)}
                >
                  <p className="font-bold">{c.name}</p>
                  <p className="text-muted-foreground text-sm">{c.email}</p>
                </Card>
              ))
            ) : (
              <p className="text-gray-600">No candidates found.</p>
            )}
          </div>
        </div>

        {/* Notifications Section */}
        <div className="w-full lg:w-1/3">
          <h2 className="text-2xl font-bold mb-2">Your Notifications</h2>
          <div className="space-y-2 max-w-full">
            {notifications.length > 0 ? (
              notifications.map((n, i) => (
                <Card
                  key={i}
                  className="p-2 cursor-pointer hover:bg-gray-200"
   onClick={() => {
  const cid = n.candidateId?._id || n.candidateId;

  if (!cid) {
    toast.error("Invalid candidate ID in notification");
    return;
  }

  navigate(`/candidate/${cid}?highlight=${n.noteId}`);
}}


                >
                  <p className="text-sm text-muted-foreground">
                    Candidate: {n.candidateName}
                  </p>
                  <p className="text-md font-medium">{n.message}</p>
                </Card>
              ))
            ) : (
              <p className="text-gray-600">No notifications yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
