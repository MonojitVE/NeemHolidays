import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";

export default function Blogs() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadBlogs = async () => {
    try {
      const res = await api.get("/content/public");
      setBlogs(res.data || []);
    } catch {
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBlogs();
  }, []);

  if (loading) {
    return <p className="center">Loading travel blogs...</p>;
  }

  return (
    <>
      <section className="hero small">
        <div className="hero-actions">
          <Link to="/" className="home-btn">
            ← Back to Home
          </Link>
        </div>

        <p className="eyebrow">Travel Stories</p>

        <h1>Latest Travel Blogs</h1>

        <p>
          Explore fresh travel news, destination updates, and AI-curated travel
          inspiration.
        </p>
      </section>

      <section className="public-blog-grid">
        {blogs.length === 0 ? (
          <div className="card">
            <h2>No public blogs yet</h2>
            <p>Approved blogs will appear here automatically.</p>
          </div>
        ) : (
          blogs.map((blog) => (
            <article className="public-blog-card" key={blog.id}>
              <div className="public-blog-top">
                <span>TRAVEL UPDATE</span>
                <h2>{blog.blog_title}</h2>
              </div>

              <p className="meta-text">{blog.meta_description}</p>

              <div className="public-blog-content">
                {(blog.article || "")
                  .split("\n")
                  .filter((p) => p.trim() !== "")
                  .slice(0, 3)
                  .map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
              </div>

              <p className="hashtags">{blog.hashtags}</p>

              <p className="cta-line">{blog.cta}</p>
            </article>
          ))
        )}
      </section>
    </>
  );
}


