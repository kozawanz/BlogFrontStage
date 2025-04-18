"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { BaseUrl } from "../constants"
import "./MyPosts.css"
import { ThumbsUp, ThumbsDown, Calendar, User, ChevronLeft, ChevronRight, X, Edit, Trash } from "lucide-react"

const MyPosts = () => {
  // Initialize posts as an empty array to prevent "slice is not a function" error
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actionLoading, setActionLoading] = useState({})
  const Token = localStorage.getItem("Token")

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [postsPerPage] = useState(6)
  const [totalPosts, setTotalPosts] = useState(0)

  // Modal state
  const [selectedPost, setSelectedPost] = useState(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)

  // Edit form state
  const [editFormData, setEditFormData] = useState({
    title: "",
    content: "",
    status: "published", // Add status field with default value
  })

  // Check if user is logged in
  useEffect(() => {
    if (!Token) {
      setError("You must be logged in to view your posts")
      setLoading(false)
      return
    }
// eslint-disable-next-line
    fetchPosts()
    // eslint-disable-next-line
  }, [Token])

  // eslint-disable-next-line
  const fetchPosts = () => {
    setLoading(true)
    setError(null)

    const config = {
      method: "get",
      maxBodyLength: Number.POSITIVE_INFINITY,
      url: BaseUrl + "/api/posts/my_posts/",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Token " + Token,
      },
    }

    axios
      .request(config)
      .then((response) => {
        console.log("My Posts data:", response.data)

        // Ensure posts is always an array
        const postsData = Array.isArray(response.data) ? response.data : []
        setPosts(postsData)
        setTotalPosts(postsData.length)
        setLoading(false)
      })
      .catch((error) => {
        console.error("Error fetching posts:", error)
        setError(error.response?.data?.error || "An error occurred while fetching your posts")
        setLoading(false)
      })
  }

  const handleLike = (post) => {
    setActionLoading((prev) => ({ ...prev, [`like-${post.id}`]: true }))

    const config = {
      method: "post",
      maxBodyLength: Number.POSITIVE_INFINITY,
      url: BaseUrl + "/api/posts/" + post.slug + "/toggle_like/",
      headers: {
        Authorization: "Token " + Token,
        "Content-Type": "application/json",
      },
    }

    axios
      .request(config)
      .then((response) => {
        console.log("Like response:", response.data)

        // If the API returns a single updated post
        if (response.data && response.data.id) {
          const updatedPost = response.data
          setPosts(posts.map((p) => (p.id === updatedPost.id ? updatedPost : p)))

          // If the modal is open and showing this post, update it there too
          if (isEditModalOpen && selectedPost && selectedPost.id === updatedPost.id) {
            setSelectedPost(updatedPost)
          }
        }
        // If the API returns all posts as an array
        else if (Array.isArray(response.data)) {
          setPosts(response.data)

          // If the modal is open, find and update the selected post
          if (isEditModalOpen && selectedPost) {
            const updatedSelectedPost = response.data.find((p) => p.id === selectedPost.id)
            if (updatedSelectedPost) {
              setSelectedPost(updatedSelectedPost)
            }
          }
        }
        // Fallback to manual update
        else {
          const updatedPosts = posts.map((p) => {
            if (p.id === post.id) {
              const wasLiked = p.user_has_liked
              return {
                ...p,
                like_count: wasLiked ? p.like_count - 1 : p.like_count + 1,
                user_has_liked: !wasLiked,
                // If user is liking and had previously disliked, remove the dislike
                dislike_count: p.user_has_disliked ? p.dislike_count - 1 : p.dislike_count,
                user_has_disliked: p.user_has_disliked ? false : p.user_has_disliked,
              }
            }
            return p
          })

          setPosts(updatedPosts)

          // If the modal is open and showing this post, update it there too
          if (isEditModalOpen && selectedPost && selectedPost.id === post.id) {
            const updatedSelectedPost = updatedPosts.find((p) => p.id === post.id)
            if (updatedSelectedPost) {
              setSelectedPost(updatedSelectedPost)
            }
          }
        }
      })
      .catch((error) => {
        console.error("Error liking post:", error)
        alert(error.response?.data?.error || "An error occurred while liking the post")
      })
      .finally(() => {
        setActionLoading((prev) => ({ ...prev, [`like-${post.id}`]: false }))
      })
  }

  const handleDislike = (post) => {
    setActionLoading((prev) => ({ ...prev, [`dislike-${post.id}`]: true }))

    const config = {
      method: "post",
      maxBodyLength: Number.POSITIVE_INFINITY,
      url: BaseUrl + "/api/posts/" + post.slug + "/toggle_dislike/",
      headers: {
        Authorization: "Token " + Token,
        "Content-Type": "application/json",
      },
    }

    axios
      .request(config)
      .then((response) => {
        console.log("Dislike response:", response.data)

        // If the API returns a single updated post
        if (response.data && response.data.id) {
          const updatedPost = response.data
          setPosts(posts.map((p) => (p.id === updatedPost.id ? updatedPost : p)))

          // If the modal is open and showing this post, update it there too
          if (isEditModalOpen && selectedPost && selectedPost.id === updatedPost.id) {
            setSelectedPost(updatedPost)
          }
        }
        // If the API returns all posts as an array
        else if (Array.isArray(response.data)) {
          setPosts(response.data)

          // If the modal is open, find and update the selected post
          if (isEditModalOpen && selectedPost) {
            const updatedSelectedPost = response.data.find((p) => p.id === selectedPost.id)
            if (updatedSelectedPost) {
              setSelectedPost(updatedSelectedPost)
            }
          }
        }
        // Fallback to manual update
        else {
          const updatedPosts = posts.map((p) => {
            if (p.id === post.id) {
              const wasDisliked = p.user_has_disliked
              return {
                ...p,
                dislike_count: wasDisliked ? p.dislike_count - 1 : p.dislike_count + 1,
                user_has_disliked: !wasDisliked,
                // If user is disliking and had previously liked, remove the like
                like_count: p.user_has_liked ? p.like_count - 1 : p.like_count,
                user_has_liked: p.user_has_liked ? false : p.user_has_liked,
              }
            }
            return p
          })

          setPosts(updatedPosts)

          // If the modal is open and showing this post, update it there too
          if (isEditModalOpen && selectedPost && selectedPost.id === post.id) {
            const updatedSelectedPost = updatedPosts.find((p) => p.id === post.id)
            if (updatedSelectedPost) {
              setSelectedPost(updatedSelectedPost)
            }
          }
        }
      })
      .catch((error) => {
        console.error("Error disliking post:", error)
        alert(error.response?.data?.error || "An error occurred while disliking the post")
      })
      .finally(() => {
        setActionLoading((prev) => ({ ...prev, [`dislike-${post.id}`]: false }))
      })
  }

  const handleUpdatePost = (e) => {
    e.preventDefault()
    setActionLoading((prev) => ({ ...prev, update: true }))

    const config = {
      method: "patch",
      url: BaseUrl + "/api/posts/" + selectedPost.slug + "/",
      headers: {
        Authorization: "Token " + Token,
        "Content-Type": "application/json",
      },
      data: editFormData,
    }

    axios
      .request(config)
      .then((response) => {
        console.log("Update response:", response.data)

        // Close the modal
        closeAllModals()

        // Refresh the posts list
        fetchPosts()

        // Show success message
        alert("Post updated successfully!")
      })
      .catch((error) => {
        console.error("Error updating post:", error)
        alert(error.response?.data?.error || "An error occurred while updating the post")
      })
      .finally(() => {
        setActionLoading((prev) => ({ ...prev, update: false }))
      })
  }

  const handleDeletePost = () => {
    setActionLoading((prev) => ({ ...prev, delete: true }))

    const config = {
      method: "delete",
      url: BaseUrl + "/api/posts/" + selectedPost.slug + "/",
      headers: {
        Authorization: "Token " + Token,
        "Content-Type": "application/json",
      },
    }

    axios
      .request(config)
      .then((response) => {
        console.log("Delete response:", response.data)

        // Close the modal
        closeAllModals()

        // Refresh the posts list
        fetchPosts()

        // Show success message
        alert("Post deleted successfully!")
      })
      .catch((error) => {
        console.error("Error deleting post:", error)
        alert(error.response?.data?.error || "An error occurred while deleting the post")
      })
      .finally(() => {
        setActionLoading((prev) => ({ ...prev, delete: false }))
      })
  }

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  const truncateText = (text, maxLength = 200) => {
    if (!text) return ""
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength) + "..."
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber)
    scrollToTop()
  }

  const openEditModal = (post) => {
    setSelectedPost(post)
    setEditFormData({
      title: post.title,
      content: post.content || "",
      status: post.status || "published", // Set status from post or default to published
    })
    setIsEditModalOpen(true)
    document.body.style.overflow = "hidden"
  }

  const openDeleteConfirm = () => {
    setIsDeleteConfirmOpen(true)
  }

  const closeAllModals = () => {
    setIsEditModalOpen(false)
    setIsDeleteConfirmOpen(false)
    setSelectedPost(null)
    document.body.style.overflow = "auto"
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Handle ESC key to close modals
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.keyCode === 27) closeAllModals()
    }
    window.addEventListener("keydown", handleEsc)

    return () => {
      window.removeEventListener("keydown", handleEsc)
      document.body.style.overflow = "auto"
    }
  }, [])

  // Add defensive code to ensure posts is always an array before calling slice
  const safeSlice = (array, start, end) => {
    if (!Array.isArray(array)) return []
    return array.slice(start, end)
  }

  // Calculate pagination values with defensive code
  const indexOfLastPost = currentPage * postsPerPage
  const indexOfFirstPost = indexOfLastPost - postsPerPage
  const currentPosts = safeSlice(posts, indexOfFirstPost, indexOfLastPost)
  const totalPages = Math.ceil((Array.isArray(posts) ? posts.length : 0) / postsPerPage)

  if (loading && posts.length === 0) {
    return (
      <div className="blog-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your posts...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="blog-container">
        <div className="error-container">
          <h2>Error</h2>
          <p>{error}</p>
          {Token && (
            <button className="retry-button" onClick={fetchPosts}>
              Try Again
            </button>
          )}
          {!Token && <p>Please log in to view your posts.</p>}
        </div>
      </div>
    )
  }

  return (
    <div className="blog-container">
      <header className="blog-header">
        <h1>My Posts</h1>
        <p className="blog-description">Manage your blog posts</p>
      </header>

      {!Array.isArray(posts) || posts.length === 0 ? (
        <div className="no-posts">You haven't created any posts yet.</div>
      ) : (
        <>
          <p>Total Posts: {totalPosts}</p>
          <div className="posts-grid">
            {currentPosts.map((post) => (
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
                  {post.status === "draft" && <div className="post-status draft">Draft</div>}
                </div>

                <div className="post-content">
                  <p>{truncateText(post.content)}</p>
                </div>

                <div className="post-footer">
                  <div className="post-actions">
                    <button
                      className={`action-button like-button ${post.user_has_liked ? "active" : ""}`}
                      onClick={() => handleLike(post)}
                      disabled={actionLoading[`like-${post.id}`]}
                      aria-label="Like"
                      title="Like this post"
                    >
                      {actionLoading[`like-${post.id}`] ? (
                        <span className="loading-spinner" aria-hidden="true"></span>
                      ) : (
                        <ThumbsUp size={18} aria-hidden="true" />
                      )}
                      <span>{post.like_count || 0}</span>
                    </button>

                    <button
                      className={`action-button dislike-button ${post.user_has_disliked ? "active" : ""}`}
                      onClick={() => handleDislike(post)}
                      disabled={actionLoading[`dislike-${post.id}`]}
                      aria-label="Dislike"
                      title="Dislike this post"
                    >
                      {actionLoading[`dislike-${post.id}`] ? (
                        <span className="loading-spinner" aria-hidden="true"></span>
                      ) : (
                        <ThumbsDown size={18} aria-hidden="true" />
                      )}
                      <span>{post.dislike_count || 0}</span>
                    </button>
                  </div>

                  <div className="post-management">
                    <button onClick={() => openEditModal(post)} className="edit-button">
                      <Edit size={16} />
                      Edit
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Client-side pagination controls */}
          {totalPages > 1 && (
            <div className="pagination-container">
              <div className="pagination-info">
                Page {currentPage} of {totalPages}
              </div>
              <div className="pagination-controls">
                <button
                  className="pagination-button prev"
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft size={16} /> Previous
                </button>

                <div className="pagination-numbers">
                  {[...Array(totalPages).keys()].map((number) => (
                    <button
                      key={number + 1}
                      className={`pagination-number ${currentPage === number + 1 ? "active" : ""}`}
                      onClick={() => paginate(number + 1)}
                    >
                      {number + 1}
                    </button>
                  ))}
                </div>

                <button
                  className="pagination-button next"
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {loading && posts.length > 0 && (
            <div className="loading-overlay">
              <div className="loading-spinner"></div>
            </div>
          )}

          {/* Edit Post Modal */}
          {isEditModalOpen && selectedPost && (
            <div className="modal-overlay" onClick={closeAllModals}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={closeAllModals}>
                  <X size={24} />
                </button>

                <div className="modal-post">
                  <h2 className="modal-post-title">Edit Post</h2>

                  <form onSubmit={handleUpdatePost} className="edit-form">
                    <div className="form-group">
                      <label htmlFor="title">Title</label>
                      <input
                        type="text"
                        id="title"
                        name="title"
                        value={editFormData.title}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="content">Content</label>
                      <textarea
                        id="content"
                        name="content"
                        value={editFormData.content}
                        onChange={handleInputChange}
                        rows="10"
                        required
                      ></textarea>
                    </div>

                    <div className="form-group">
                      <label>Status</label>
                      <div className="radio-group">
                        <label className="radio-label">
                          <input
                            type="radio"
                            name="status"
                            value="published"
                            checked={editFormData.status === "published"}
                            onChange={handleInputChange}
                          />
                          Published
                        </label>
                        <label className="radio-label">
                          <input
                            type="radio"
                            name="status"
                            value="draft"
                            checked={editFormData.status === "draft"}
                            onChange={handleInputChange}
                          />
                          Draft
                        </label>
                      </div>
                      <p className="status-help-text">
                        {editFormData.status === "published"
                          ? "Published posts are visible to all users."
                          : "Draft posts are only visible to you."}
                      </p>
                    </div>

                    <div className="form-actions">
                      <button type="submit" className="update-button" disabled={actionLoading.update}>
                        {actionLoading.update ? (
                          <>
                            <span className="loading-spinner" aria-hidden="true"></span>
                            Updating...
                          </>
                        ) : (
                          "Update Post"
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={openDeleteConfirm}
                        className="delete-button"
                        disabled={actionLoading.delete}
                      >
                        {actionLoading.delete ? (
                          <>
                            <span className="loading-spinner" aria-hidden="true"></span>
                            Deleting...
                          </>
                        ) : (
                          <>
                            <Trash size={16} />
                            Delete Post
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {isDeleteConfirmOpen && selectedPost && (
            <div className="modal-overlay" onClick={(e) => e.stopPropagation()}>
              <div className="confirm-modal">
                <h3>Delete Post</h3>
                <p>Are you sure you want to delete "{selectedPost.title}"?</p>
                <p className="warning">This action cannot be undone.</p>

                <div className="confirm-actions">
                  <button onClick={closeAllModals} className="cancel-button" disabled={actionLoading.delete}>
                    Cancel
                  </button>
                  <button onClick={handleDeletePost} className="confirm-delete-button" disabled={actionLoading.delete}>
                    {actionLoading.delete ? (
                      <>
                        <span className="loading-spinner" aria-hidden="true"></span>
                        Deleting...
                      </>
                    ) : (
                      "Delete"
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default MyPosts
