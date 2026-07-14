import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";
import 'dotenv/config';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Use JSON middleware to parse body
  app.use(express.json({ limit: '50mb' }));

  // Initialize Supabase client lazily
  let supabaseClient: any = null;

  function getSupabase() {
    if (!supabaseClient) {
      const url = process.env.SUPABASE_URL;
      const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
      
      if (!url || !key) {
        throw new Error('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing');
      }
      
      supabaseClient = createClient(url, key);
    }
    return supabaseClient;
  }

  // API Route to sync data
  app.post("/api/sync-balancete", async (req, res) => {
    try {
      const supabase = getSupabase();
      const items = req.body;

      if (!Array.isArray(items)) {
        return res.status(400).json({ error: "Invalid data format. Expected an array of items." });
      }

      // Insert data into Supabase
      // Assuming a table named 'balancete_items'
      const { data, error } = await supabase
        .from('balancete_items')
        .insert(items);

      if (error) {
        console.error("Supabase insert error:", error);
        return res.status(500).json({ error: error.message });
      }

      res.json({ success: true, count: items.length });
    } catch (err: any) {
      console.error("Sync error:", err);
      res.status(500).json({ error: err.message || "Failed to sync to Supabase." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
