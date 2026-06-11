import { useEffect, useState } from "react";
import api from "../api/client";
import StatusBadge from "../components/StatusBadge";

export default function ContentReview() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [actionId, setActionId] = useState(null);

  const load = async () => {
    try {
      const res = await api.get("/content/pending");
      setItems(res.data || []);
    } catch (error) {
      alert("Failed to load generated blogs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const fetchAndGenerate = async () => {
    try {
      setFetching(true);

      const res = await api.post("/feeds/fetch");

      alert(
        `Fetched ${res.data.new_articles} new articles and generated ${res.data.generated_content} AI blogs.`
      );

      await load();
    } catch (error) {
      alert("RSS fetch and AI blog generation failed.");
    } finally {
      setFetching(false);
    }
  };

  const accept = async (id) => {
    try {
      setActionId(id);

      await api.post(`/content/${id}/accept`);

      await load();

      alert("Selected blog accepted and posted successfully.");
    } catch (error) {
      alert("Accept/post failed.");
    } finally {
      setActionId(null);
    }
  };

  const reject = async (id) => {
    try {
      setActionId(id);

      await api.post(`/content/${id}/reject`);

      await load();

      alert("Selected blog rejected.");
    } catch (error) {
      alert("Reject failed.");
    } finally {
      setActionId(null);
    }
  };

  if (loading) {
    return <p>Loading content review...</p>;
  }

  return (
    <>
      <div className="page-head">
        <div>
          <p className="eyebrow">AI Travel Content Review</p>
          <h1>Generated Travel Blogs</h1>
          <p>
            Fetch latest travel news, auto-generate AI blogs, then accept or reject each post.
          </p>
        </div>

        <button type="button" onClick={fetchAndGenerate} disabled={fetching}>
          {fetching ? "Fetching & Generating..." : "Fetch RSS & Generate Blogs"}
        </button>
      </div>

      {items.length === 0 ? (
        <div className="card empty-state">
          <h2>No pending blogs</h2>
          <p>Click “Fetch RSS & Generate Blogs” to create fresh AI travel content.</p>
        </div>
      ) : (
        <div className="review-list">
          {items.map((content) => (
            <div className="card blog-review-card" key={content.id}>
              <div className="blog-hero">
                <span>TRAVEL CONTENT</span>
                <h2>{content.blog_title}</h2>
              </div>

              <StatusBadge status={content.status} />

              <section className="blog-section">
                <h3>SEO Details</h3>
                <p>
                  <b>Slug:</b> {content.slug}
                </p>
                <p>
                  <b>Meta Description:</b> {content.meta_description}
                </p>
              </section>

              <section className="blog-section">
                <h3>Generated Blog</h3>

                <article className="formatted-blog">
                  {(content.article || "")
                    .split("\n")
                    .filter((paragraph) => paragraph.trim() !== "")
                    .map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                </article>
              </section>

              <section className="blog-section">
                <h3>Social Media Ready Posts</h3>

                <div className="social-grid">
                  <div>
                    <h4>Instagram</h4>
                    <p>{content.instagram_caption}</p>
                  </div>

                  <div>
                    <h4>Facebook</h4>
                    <p>{content.facebook_post}</p>
                  </div>

                  <div>
                    <h4>LinkedIn</h4>
                    <p>{content.linkedin_post}</p>
                  </div>
                </div>
              </section>

              <section className="blog-section">
                <p>
                  <b>Hashtags:</b> {content.hashtags}
                </p>
                <p>
                  <b>CTA:</b> {content.cta}
                </p>
              </section>

              <div className="actions">
                <button
                  type="button"
                  disabled={actionId === content.id}
                  onClick={() => accept(content.id)}
                >
                  {actionId === content.id ? "Posting..." : "Accept & Auto Post"}
                </button>

                <button
                  type="button"
                  className="danger"
                  disabled={actionId === content.id}
                  onClick={() => reject(content.id)}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}