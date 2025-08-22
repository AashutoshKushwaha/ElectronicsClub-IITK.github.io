import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./ArticlePage.css";

function ArticlePage() {
  const { id } = useParams();
  const [content, setContent] = useState("");

  useEffect(() => {
    fetch(require(`../database/articles/${id}.md`))
      .then(res => res.text())
      .then(text => setContent(text));
  }, [id]);

  if (!content) {
    return <div style={{ textAlign: 'center', color: '#BBDF4D', marginTop: '40px' }}>Loading article...</div>;
  }

  return (
    <div className="article-page">
      <Link to="/database/Articles" className="back-link">← Back to Articles</Link>
      <ReactMarkdown children={content} remarkPlugins={[remarkGfm]} />
    </div>
  );
}

export default ArticlePage;
