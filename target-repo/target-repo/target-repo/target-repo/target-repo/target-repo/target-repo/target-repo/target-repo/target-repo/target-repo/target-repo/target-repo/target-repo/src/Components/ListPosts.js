import { useEffect, useState } from "react"
import axios from "axios"
import { BaseUrl } from "../constants"
import "./ListPosts.css"
import { Calendar, User, ChevronLeft, ChevronRight } from "lucide-react"

const ListPosts = () => {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [nextPage, setNextPage] = useState(null)
  const [prevPage, setPrevPage] = useState(null)

  useEffect(() => {
    fetchPosts(BaseUrl + "/api/posts/")
  }, [])

  const fetchPosts = (url) => {
    setLoading(true)
    const config = {
      method: "get",
      maxBodyLength: Number.POSITIVE_INFINITY,
      url: url,
    }

    axios
      .request(config)
      .then((response) => {
        console.log(JSON.stringify(response.data))
        setPosts(response.data.results)
        setNextPage(response.data.next)
        setPrevPage(response.data.previous)
        setLoading(false)
      })
      .catch((error) => {
        console.log(error)
        setError(error.response?.data?.error || "An error occurred")
        setLoading(false)
      })
  }

  const handlePageChange = (url) => {
    if (url) {
      fetchPosts(url)
      // Scroll to top when changing pages
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  if (loading && posts.length === 0) {
    return <div className="blog-container loading">Loading posts...</div>
  }

  if (error) {
    return <div className="blog-container error">Error: {error}</div>
  }

  return (
    <div className="blog-container">
      <header className="blog-header">
        <h1>My Blog</h1>
        <p className="blog-description">Explore the latest posts from our community</p>
      </header>

      {posts.length === 0 ? (
        <div className="no-posts">No posts available at the moment.</div>
      ) : (
        <>
          <div className="posts-grid">
            {posts.map((post) => (
              <article key={post.id} className="post-card">
                <div className="post-header">
                  <h2 className="post-title">{post.title}</h2>
                  <div className="post-meta">
                    <div className="post-author">
                      <User size={16} />
                      <span>
                        {post.author.first_name} {post.author.last_name}
                      </span>
                    </div>
                    <div className="post-date">
                      <Calendar size={16} />
                      <span>{formatDate(post.created_at)}</span>
                    </div>
                  </div>
                </div>

                <div className="post-content">
                  <p>
                    {post.content ||
                      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."}
                  </p>
                </div>

              </article>
            ))}
          </div>

          {/* Pagination controls at the bottom of the page */}
          {(nextPage || prevPage) && (
            <div className="pagination-container">
              <div className="pagination-controls">
                {prevPage ? (
                  <button className="pagination-button prev" onClick={() => handlePageChange(prevPage)}>
                    <ChevronLeft size={16} /> Previous Page
                  </button>
                ) : (
                  <div className="pagination-spacer"></div>
                )}

                {loading && <div className="pagination-loading">Loading...</div>}

                {nextPage ? (
                  <button className="pagination-button next" onClick={() => handlePageChange(nextPage)}>
                    Next Page <ChevronRight size={16} />
                  </button>
                ) : (
                  <div className="pagination-spacer"></div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default ListPosts
