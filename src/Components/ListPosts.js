"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { BaseUrl } from "../constants"
import "./ListPosts.css"
import { ThumbsUp, ThumbsDown, Calendar, User, ChevronLeft, ChevronRight } from "lucide-react"

const ListPosts = () => {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [nextPage, setNextPage] = useState(null)
  const [prevPage, setPrevPage] = useState(null)
  const [actionLoading, setActionLoading] = useState({})
  const Token = localStorage.getItem("Token")

 // eslint-disable-next-line
  useEffect(() => {
    fetchPosts(BaseUrl + "/api/posts/")
     // eslint-disable-next-line
  }, [])

  const fetchPosts = (url) => {
    setLoading(true)

    // Create config object with or without auth token based on login status
    const config = {
      method: "get",
      maxBodyLength: Number.POSITIVE_INFINITY,
      url: url,
      headers: {
        "Content-Type": "application/json",
      },
    }

    // Add authorization header if user is logged in
    if (Token) {
      config.headers.Authorization = "Token " + Token
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

  const handleLike = (postSlug, postId) => {
    if (!Token) {
      alert("Please log in to like posts")
      return
    }

    // Set loading state for this specific action
    setActionLoading((prev) => ({ ...prev, [`like-${postId}`]: true }))

    const config = {
      method: "post",
      maxBodyLength: Number.POSITIVE_INFINITY,
      url: BaseUrl + "/api/posts/" + postSlug + "/toggle_like/",
      headers: {
        Authorization: "Token " + Token,
        "Content-Type": "application/json",
      },
    }

    axios
      .request(config)
      .then((response) => {
        console.log(JSON.stringify(response.data))

        // If the API returns a single updated post
        if (response.data.id) {
          const updatedPost = response.data
          setPosts(posts.map((post) => (post.id === updatedPost.id ? updatedPost : post)))
        }
        // If the API returns all posts
        else if (response.data.results) {
          setPosts(response.data.results)
        }
        // Fallback to manual update if API doesn't return updated data
        else {
          // Update the specific post that was liked
          const updatedPosts = posts.map((post) => {
            if (post.id === postId) {
              // Toggle like status
              const wasLiked = post.user_has_liked
              return {
                ...post,
                like_count: wasLiked ? post.like_count - 1 : post.like_count + 1,
                user_has_liked: !wasLiked,
                // If user is liking and had previously disliked, remove the dislike
                dislike_count: post.user_has_disliked ? post.dislike_count - 1 : post.dislike_count,
                user_has_disliked: post.user_has_disliked ? false : post.user_has_disliked,
              }
            }
            return post
          })
          setPosts(updatedPosts)
        }
      })
      .catch((error) => {
        console.log(error)
        alert(error.response?.data?.error || error.response?.data?.detail || "An error occurred")
      })
      .finally(() => {
        // Clear loading state for this action
        setActionLoading((prev) => ({ ...prev, [`like-${postId}`]: false }))
      })
  }

  const handleDislike = (postSlug, postId) => {
    if (!Token) {
      alert("Please log in to dislike posts")
      return
    }

    // Set loading state for this specific action
    setActionLoading((prev) => ({ ...prev, [`dislike-${postId}`]: true }))

    const config = {
      method: "post",
      maxBodyLength: Number.POSITIVE_INFINITY,
      url: BaseUrl + "/api/posts/" + postSlug + "/toggle_dislike/",
      headers: {
        Authorization: "Token " + Token,
        "Content-Type": "application/json",
      },
    }

    axios
      .request(config)
      .then((response) => {
        console.log(JSON.stringify(response.data))

        // If the API returns a single updated post
        if (response.data.id) {
          const updatedPost = response.data
          setPosts(posts.map((post) => (post.id === updatedPost.id ? updatedPost : post)))
        }
        // If the API returns all posts
        else if (response.data.results) {
          setPosts(response.data.results)
        }
        // Fallback to manual update if API doesn't return updated data
        else {
          // Update the specific post that was disliked
          const updatedPosts = posts.map((post) => {
            if (post.id === postId) {
              // Toggle dislike status
              const wasDisliked = post.user_has_disliked
              return {
                ...post,
                dislike_count: wasDisliked ? post.dislike_count - 1 : post.dislike_count + 1,
                user_has_disliked: !wasDisliked,
                // If user is disliking and had previously liked, remove the like
                like_count: post.user_has_liked ? post.like_count - 1 : post.like_count,
                user_has_liked: post.user_has_liked ? false : post.user_has_liked,
              }
            }
            return post
          })
          setPosts(updatedPosts)
        }
      })
      .catch((error) => {
        console.log(error)
        alert(error.response?.data?.error || "An error occurred")
      })
      .finally(() => {
        // Clear loading state for this action
        setActionLoading((prev) => ({ ...prev, [`dislike-${postId}`]: false }))
      })
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

                <div className="post-footer">
                  <div className="post-actions">
                    <button
                      className={`action-button like-button ${post.user_has_liked ? "active" : ""}`}
                      onClick={() => handleLike(post.slug, post.id)}
                      disabled={!Token || actionLoading[`like-${post.id}`]}
                      title={Token ? "Like this post" : "Log in to like posts"}
                    >
                      {actionLoading[`like-${post.id}`] ? (
                        <span className="loading-spinner"></span>
                      ) : (
                        <ThumbsUp size={18} />
                      )}
                      <span>{post.like_count || 0}</span>
                    </button>

                    <button
                      className={`action-button dislike-button ${post.user_has_disliked ? "active" : ""}`}
                      onClick={() => handleDislike(post.slug, post.id)}
                      disabled={!Token || actionLoading[`dislike-${post.id}`]}
                      title={Token ? "Dislike this post" : "Log in to dislike posts"}
                    >
                      {actionLoading[`dislike-${post.id}`] ? (
                        <span className="loading-spinner"></span>
                      ) : (
                        <ThumbsDown size={18} />
                      )}
                      <span>{post.dislike_count || 0}</span>
                    </button>
                  </div>

                  <a href={`/post/${post.id}`} className="read-more">
                    Read More
                  </a>
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
