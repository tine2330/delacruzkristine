import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ginskvvntbotgruavvhd.supabase.co"; 
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdpbnNrdnZudGJvdGdydWF2dmhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxNTU1MzAsImV4cCI6MjA3NzczMTUzMH0.NPgHrT5YdwECjrvIuQUx92dQIfNv6BD1sOhUJPM-dd4"; 

export const supabase = createClient(supabaseUrl, supabaseKey);
