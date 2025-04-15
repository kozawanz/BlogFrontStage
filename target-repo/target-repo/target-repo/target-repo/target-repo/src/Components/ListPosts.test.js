import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { BaseUrl } from "../constants"
import ListPosts from "../Components/ListPosts"

// Create a mock for axios with all the methods we need
const mockAxios = {
  request: jest.fn(),
}

// Mock the entire axios module
jest.mock("axios", () => ({
  __esModule: true,
  default: {
    request: (...args) => mockAxios.request(...args),
  },
}))

// Mock the constants
jest.mock("../constants", () => ({
  BaseUrl: "https://test-api.com",
}))

describe("ListPosts Component", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    mockAxios.request.mockReset()

    // Mock localStorage
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
    })

    // Mock window.scrollTo
    window.scrollTo = jest.fn()

    // Mock console methods to prevent cluttering test output
    console.log = jest.fn()
    console.error = jest.fn()
  })

  afterEach(() => {
    // Clean up after each test
    jest.clearAllMocks()
  })

  test("renders loading state initially", () => {
    // Mock axios to delay response
    mockAxios.request.mockImplementation(() => new Promise(() => {}))

    render(<ListPosts />)

    // Check if loading indicator is displayed
    expect(screen.getByText("Loading posts...")).toBeInTheDocument()
  })

  test("renders posts when data is loaded", async () => {
    // Mock successful response with sample posts
    const mockPosts = [
      {
        id: 1,
        title: "Test Post 1",
        slug: "test-post-1",
        content: "This is test content for the first post...",
        author: {
          id: 1,
          first_name: "John",
          last_name: "Doe",
        },
        created_at: "2025-04-14T10:00:00Z",
        like_count: 5,
        dislike_count: 2,
        user_has_liked: false,
        user_has_disliked: false,
      },
      {
        id: 2,
        title: "Test Post 2",
        slug: "test-post-2",
        content: "This is test content for the second post...",
        author: {
          id: 2,
          first_name: "Jane",
          last_name: "Smith",
        },
        created_at: "2025-04-13T10:00:00Z",
        like_count: 3,
        dislike_count: 1,
        user_has_liked: false,
        user_has_disliked: false,
      },
    ]

    // Make sure the mock returns the data correctly
    mockAxios.request.mockResolvedValueOnce({ data: mockPosts })

    render(<ListPosts />)

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText("Loading posts...")).not.toBeInTheDocument()
    })

    // Now check for the post title
    expect(screen.getByText("Test Post 1")).toBeInTheDocument()
    expect(screen.getByText("Test Post 2")).toBeInTheDocument()

    // Check if author names are displayed
    expect(screen.getByText("John Doe")).toBeInTheDocument()
    expect(screen.getByText("Jane Smith")).toBeInTheDocument()

    // Check if like/dislike counts are displayed
    expect(screen.getAllByText("5")[0]).toBeInTheDocument()
    expect(screen.getAllByText("2")[0]).toBeInTheDocument()
    expect(screen.getByText("3")).toBeInTheDocument()
    expect(screen.getByText("1")).toBeInTheDocument()
  })

  test("shows no posts message when API returns empty array", async () => {
    // Mock empty posts array
    mockAxios.request.mockResolvedValueOnce({ data: [] })

    render(<ListPosts />)

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText("Loading posts...")).not.toBeInTheDocument()
    })

    // Check for no posts message
    expect(screen.getByText("No posts available at the moment.")).toBeInTheDocument()
  })

  test("handles non-array response gracefully", async () => {
    // Mock a non-array response
    mockAxios.request.mockResolvedValueOnce({
      data: { message: "Success but not an array" },
    })

    render(<ListPosts />)

    await waitFor(() => {
      expect(screen.queryByText("Loading posts...")).not.toBeInTheDocument()
    })

    // Should show no posts message
    expect(screen.getByText("No posts available at the moment.")).toBeInTheDocument()
  })

  test("handles like button click when user is logged in", async () => {
    // Set token in localStorage to simulate logged in user
    localStorage.getItem.mockReturnValue("test-token")

    // Mock initial posts response
    const initialPosts = [
      {
        id: 1,
        title: "Test Post",
        slug: "test-post",
        content: "This is test content...",
        author: {
          id: 1,
          first_name: "John",
          last_name: "Doe",
        },
        created_at: "2025-04-14T10:00:00Z",
        like_count: 5,
        dislike_count: 2,
        user_has_liked: false,
        user_has_disliked: false,
      },
    ]

    // Mock response after liking
    const updatedPost = {
      id: 1,
      title: "Test Post",
      slug: "test-post",
      content: "This is test content...",
      author: {
        id: 1,
        first_name: "John",
        last_name: "Doe",
      },
      created_at: "2025-04-14T10:00:00Z",
      like_count: 6,
      dislike_count: 2,
      user_has_liked: true,
      user_has_disliked: false,
    }

    // Set up the mock responses
    mockAxios.request.mockResolvedValueOnce({ data: initialPosts })
    mockAxios.request.mockResolvedValueOnce({ data: updatedPost })

    render(<ListPosts />)

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText("Loading posts...")).not.toBeInTheDocument()
    })

    // Now check for the post title
    expect(screen.getByText("Test Post")).toBeInTheDocument()

    // Find and click the like button
    const likeButton = screen.getByLabelText("Like")
    fireEvent.click(likeButton)

    // Verify the API call was made with correct parameters
    await waitFor(() => {
      expect(mockAxios.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: "post",
          url: BaseUrl + "/api/posts/test-post/toggle_like/",
          headers: expect.objectContaining({
            Authorization: "Token test-token",
          }),
        }),
      )
    })
  })

  test("shows alert when trying to like without being logged in", async () => {
    // Set token to null to simulate not logged in
    localStorage.getItem.mockReturnValue(null)

    // Mock window.alert
    window.alert = jest.fn()

    // Mock posts response
    const mockPosts = [
      {
        id: 1,
        title: "Test Post",
        slug: "test-post",
        content: "This is test content...",
        author: {
          id: 1,
          first_name: "John",
          last_name: "Doe",
        },
        created_at: "2025-04-14T10:00:00Z",
        like_count: 5,
        dislike_count: 2,
        user_has_liked: false,
        user_has_disliked: false,
      },
    ]

    mockAxios.request.mockResolvedValueOnce({ data: mockPosts })

    render(<ListPosts />)

    // Wait for posts to load
    await waitFor(() => {
      expect(screen.queryByText("Loading posts...")).not.toBeInTheDocument()
    })

    // Find like button (should be disabled)
    const likeButton = screen.getByLabelText("Like")
    expect(likeButton).toBeDisabled()

    // Try to click it anyway (using userEvent to bypass disabled)
    userEvent.click(likeButton)

    // Should not make API call
    expect(mockAxios.request).toHaveBeenCalledTimes(1) // Only the initial posts fetch
  })



  test("handles client-side pagination correctly", async () => {
    // Setup with many posts to trigger pagination
    const manyPosts = Array.from({ length: 15 }, (_, i) => ({
      id: i + 1,
      title: `Test Post ${i + 1}`,
      slug: `test-post-${i + 1}`,
      content: `This is test content for post ${i + 1}...`,
      author: {
        id: 1,
        first_name: "John",
        last_name: "Doe",
      },
      created_at: "2025-04-14T10:00:00Z",
      like_count: 0,
      dislike_count: 0,
      user_has_liked: false,
      user_has_disliked: false,
    }))

    mockAxios.request.mockResolvedValueOnce({ data: manyPosts })

    render(<ListPosts />)

    // Wait for posts to load
    await waitFor(() => {
      expect(screen.queryByText("Loading posts...")).not.toBeInTheDocument()
    })

    // Should show pagination controls
    expect(screen.getByText("Next")).toBeInTheDocument()

    // Should show page info
    expect(screen.getByText("Page 1 of 3")).toBeInTheDocument()

    // Click next page
    fireEvent.click(screen.getByText("Next"))

    // Should call scrollToTop
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" })

    // Should now show page 2
    expect(screen.getByText("Page 2 of 3")).toBeInTheDocument()
  })

  test("truncates post content and shows read more link", async () => {
    // Create a post with long content
    const longContentPost = {
      id: 1,
      title: "Long Content Post",
      slug: "long-content-post",
      content:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
      author: {
        id: 1,
        first_name: "John",
        last_name: "Doe",
      },
      created_at: "2025-04-14T10:00:00Z",
      like_count: 0,
      dislike_count: 0,
      user_has_liked: false,
      user_has_disliked: false,
    }

    mockAxios.request.mockResolvedValueOnce({ data: [longContentPost] })

    render(<ListPosts />)

    await waitFor(() => {
      expect(screen.queryByText("Loading posts...")).not.toBeInTheDocument()
    })

    // Content should be truncated
    expect(screen.getByText(/Lorem ipsum dolor sit amet/)).toBeInTheDocument()
    expect(screen.getByText(/\.\.\./)).toBeInTheDocument()

    // Should have a read more link
    expect(screen.getByText("Read More")).toBeInTheDocument()
    expect(screen.getByText("Read More").closest("a")).toHaveAttribute("href", "/post/1")
  })
})
