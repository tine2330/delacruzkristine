import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import "./App.css";

type Task = {
  id: number;
  title: string;
  description: string;
  image_url?: string | null;
  video_url?: string | null;
  created_at: string;
  user_id: string;
};

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    supabase.auth.onAuthStateChange((_event, session) => setSession(session));
  }, []);

  useEffect(() => {
    if (session) fetchTasks();
  }, [session]);

  // ----------------- CRUD FUNCTIONS -----------------

  async function fetchTasks() {
    const { data, error } = await supabase
      .from("task")
      .select("*")
      .eq("user_id", session?.user?.id)
      .order("id", { ascending: false });

    if (!error) setTasks(data || []);
    else console.error(error);
  }

  async function handleAuth() {
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) alert(error.message);
      else alert("Sign-up successful! Check your email to confirm.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) alert(error.message);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setTasks([]);
  }

  // ----------------- FILE UPLOAD -----------------
  async function uploadFile(file: File | null, folder: string) {
    if (!file) return null;
    const fileName = `${folder}/${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
      .from("task-files")
      .upload(fileName, file, { upsert: true });

    if (error) {
      alert("Upload error: " + error.message);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from("task-files")
      .getPublicUrl(fileName);
    return urlData.publicUrl;
  }

  // ----------------- ADD TASK -----------------
  async function addTask() {
    if (!title.trim()) return;

    const image_url = await uploadFile(imageFile, "images");
    const video_url = await uploadFile(videoFile, "videos");

    const { error } = await supabase.from("task").insert([
      {
        title,
        description,
        image_url,
        video_url,
        user_id: session.user.id,
      },
    ]);

    if (!error) {
      setTitle("");
      setDescription("");
      setImageFile(null);
      setVideoFile(null);
      fetchTasks();
    } else alert("Error adding task: " + error.message);
  }






  // ----------------- DELETE TASK -----------------
  async function deleteTask(id: number) {
    const { error } = await supabase.from("task").delete().eq("id", id);
    if (!error) fetchTasks();
    else alert(error.message);
  }

  // ----------------- EDIT TASK -----------------
  async function editTask(task: Task) {
    const newTitle = prompt("Edit title:", task.title);
    const newDesc = prompt("Edit description:", task.description);
    if (newTitle !== null && newDesc !== null) {
      const { error } = await supabase
        .from("task")
        .update({ title: newTitle, description: newDesc })
        .eq("id", task.id);
      if (!error) fetchTasks();
      else alert(error.message);
    }
  }

  // ----------------- RENDER AUTH -----------------
  if (!session)
    return (
      <div className="auth-container">
        <h1>{isSignUp ? "Sign Up" : "Sign In"}</h1>
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleAuth}>{isSignUp ? "Sign Up" : "Sign In"}</button>
        <p className="switch-link" onClick={() => setIsSignUp(!isSignUp)}>
          {isSignUp ? "Switch to Sign In" : "Switch to Sign Up"}
        </p>
      </div>
    );

  // ----------------- RENDER TASKS -----------------
  return (
    <div className="main-container">
      <button className="logout-btn" onClick={handleLogout}>
        Log Out
      </button>
      <h1>Task Manager CRUD</h1>

      <input
        placeholder="Task Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        placeholder="Task Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
        style={{ resize: "vertical" }}
      />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImageFile(e.target.files?.[0] || null)}
      />
      <input
        type="file"
        accept="video/*"
        onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
      />

      <button className="add-btn" onClick={addTask}>
        Add Task
      </button>

      {tasks.map((task) => (
        <div key={task.id} className="task-card">
          <h2 className="task-title">{task.title}</h2>
          <p className="task-desc">{task.description}</p>
          {task.image_url && (
            <img src={task.image_url} alt="Task" className="task-media" />
          )}
          {task.video_url && (
            <video
              src={task.video_url}
              controls
              className="task-media"
              style={{ maxWidth: "300px" }}
            />
          )}
          <p className="task-date">
            {new Date(task.created_at).toLocaleString()}
          </p>
          <div className="task-btns">
            <button className="edit-btn" onClick={() => editTask(task)}>
              Edit
            </button>
            <button className="delete-btn" onClick={() => deleteTask(task.id)}>
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
