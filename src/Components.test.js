// Instead of importing axios directly, we'll mock it manually
// import axios from "axios"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Register } from "./Components/Register"
import Login from "./Components/Login"
import { BaseUrl } from "./constants"
import ListPosts from "./Components/ListPosts"

// Mock axios manually instead of importing it
const mockAxios = {
  post: jest.fn(),
  request: jest.fn(),
}

beforeAll(() => {
  jest.spyOn(console, "error").mockImplementation(() => {});
  jest.spyOn(console, "log").mockImplementation(() => {});
});

// Mock the axios module
jest.mock("axios", () => ({
  __esModule: true,
  default: {
    post: (...args) => mockAxios.post(...args),
    request: (...args) => mockAxios.request(...args),
  },
}))

// Mock constants
jest.mock("./constants", () => ({
  BaseUrl: "http://test-api.com",
}))

describe("Register Component", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks()
    mockAxios.post.mockClear()
    mockAxios.request.mockClear()
  })

  test("renders register form correctly", () => {
    render(<Register />)

    // Check if all form elements are rendered
    expect(screen.getByText("Create an account")).toBeInTheDocument()
    expect(screen.getByLabelText("Username")).toBeInTheDocument()
    expect(screen.getByLabelText("Password")).toBeInTheDocument()
    expect(screen.getByLabelText("Email")).toBeInTheDocument()
    expect(screen.getByLabelText("First Name")).toBeInTheDocument()
    expect(screen.getByLabelText("Last Name")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Create Account" })).toBeInTheDocument()
  })

  test("updates input values on change", async () => {
    render(<Register />)

    // Get all input fields
    const usernameInput = screen.getByLabelText("Username")
    const passwordInput = screen.getByLabelText("Password")
    const emailInput = screen.getByLabelText("Email")
    const firstNameInput = screen.getByLabelText("First Name")
    const lastNameInput = screen.getByLabelText("Last Name")

    // Type in each input field
    await userEvent.type(usernameInput, "testuser")
    await userEvent.type(passwordInput, "password123")
    await userEvent.type(emailInput, "test@example.com")
    await userEvent.type(firstNameInput, "John")
    await userEvent.type(lastNameInput, "Doe")

    // Check if input values are updated
    expect(usernameInput).toHaveValue("testuser")
    expect(passwordInput).toHaveValue("password123")
    expect(emailInput).toHaveValue("test@example.com")
    expect(firstNameInput).toHaveValue("John")
    expect(lastNameInput).toHaveValue("Doe")
  })

  test("submits form with correct data", async () => {
    // Mock successful response
    mockAxios.post.mockResolvedValueOnce({
      data: { message: "Registration successful" },
    })

    render(<Register />)

    // Fill out the form
    await userEvent.type(screen.getByLabelText("Username"), "testuser")
    await userEvent.type(screen.getByLabelText("Password"), "password123")
    await userEvent.type(screen.getByLabelText("Email"), "test@example.com")
    await userEvent.type(screen.getByLabelText("First Name"), "John")
    await userEvent.type(screen.getByLabelText("Last Name"), "Doe")

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: "Create Account" }))

    // Check if axios.post was called with the correct arguments
    await waitFor(() => {
      expect(mockAxios.post).toHaveBeenCalledWith(
        BaseUrl + "/api/register/",
        {
          username: "testuser",
          email: "test@example.com",
          password: "password123",
          first_name: "John",
          last_name: "Doe",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
    })

    // Check if success message is displayed
    await waitFor(() => {
      expect(screen.getByText("✅ Registration successful!")).toBeInTheDocument()
    })
  })

  test("handles server error during registration", async () => {
    // Mock error response
    const errorResponse = {
      response: {
        status: 400,
        data: { error: "Username already exists" },
      },
    }
    mockAxios.post.mockRejectedValueOnce(errorResponse)

    render(<Register />)

    // Fill out the form
    await userEvent.type(screen.getByLabelText("Username"), "existinguser")
    await userEvent.type(screen.getByLabelText("Password"), "password123")
    await userEvent.type(screen.getByLabelText("Email"), "test@example.com")
    await userEvent.type(screen.getByLabelText("First Name"), "John")
    await userEvent.type(screen.getByLabelText("Last Name"), "Doe")

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: "Create Account" }))

    // Check if error message is displayed
    await waitFor(() => {
      expect(screen.getByText(/❌ Server error 400:/)).toBeInTheDocument()
    })
  })
})

describe("Login Component", () => {
  // Mock localStorage
  const localStorageMock = (() => {
    let store = {}
    return {
      getItem: jest.fn((key) => store[key] || null),
      setItem: jest.fn((key, value) => {
        store[key] = value.toString()
      }),
      clear: jest.fn(() => {
        store = {}
      }),
    }
  })()

  // Mock window.location
  const originalLocation = window.location

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks()
    mockAxios.post.mockClear()
    mockAxios.request.mockClear()

    // Setup localStorage mock
    Object.defineProperty(window, "localStorage", { value: localStorageMock })

    // Setup window.location mock
    delete window.location
    window.location = { href: "" }
  })

  let afterEach

  // eslint-disable-next-line
  afterEach = () => {
    // Restore window.location
    window.location = originalLocation
  }

  test("redirects to home if token exists", () => {
    // Set token in localStorage
    localStorageMock.getItem.mockReturnValueOnce("test-token")

    render(<Login />)

    // Check if redirected to home
    expect(window.location.href).toBe("/")
  })

  test("renders login form correctly when no token exists", () => {
    // Ensure no token in localStorage
    localStorageMock.getItem.mockReturnValueOnce(null)

    render(<Login />)

    // Check if all form elements are rendered
    // Use role to be more specific about which "Login" text we're looking for
    expect(screen.getByRole("heading", { name: "Login" })).toBeInTheDocument()
    expect(screen.getByLabelText("Username")).toBeInTheDocument()
    expect(screen.getByLabelText("Password")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Login" })).toBeInTheDocument()
  })

  test("updates input values on change", async () => {
    // Ensure no token in localStorage
    localStorageMock.getItem.mockReturnValueOnce(null)

    render(<Login />)

    // Get input fields
    const usernameInput = screen.getByLabelText("Username")
    const passwordInput = screen.getByLabelText("Password")

    // Type in each input field
    await userEvent.type(usernameInput, "testuser")
    await userEvent.type(passwordInput, "password123")

    // Check if input values are updated
    expect(usernameInput).toHaveValue("testuser")
    expect(passwordInput).toHaveValue("password123")
  })

  test("submits form and handles successful login", async () => {
    // Ensure no token in localStorage
    localStorageMock.getItem.mockReturnValueOnce(null)

    // Mock successful response
    mockAxios.request.mockResolvedValueOnce({
      data: { token: "test-token" },
    })

    render(<Login />)

    // Fill out the form
    await userEvent.type(screen.getByLabelText("Username"), "testuser")
    await userEvent.type(screen.getByLabelText("Password"), "password123")

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: "Login" }))

    // Check if mockAxios.request was called with the correct arguments
    await waitFor(() => {
      expect(mockAxios.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: "post",
          url: BaseUrl + "/api/login/",
          data: JSON.stringify({
            username: "testuser",
            password: "password123",
          }),
        }),
      )
    })

    // Check if token is stored in localStorage
    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith("Token", "test-token")
    })

    // Check if redirected to home
    await waitFor(() => {
      expect(window.location.href).toBe("/")
    })
  })

  test("handles login error", async () => {
    // Ensure no token in localStorage
    localStorageMock.getItem.mockReturnValueOnce(null)

    // Mock error response
    const errorResponse = {
      response: {
        data: { error: "Invalid credentials" },
      },
    }
    mockAxios.request.mockRejectedValueOnce(errorResponse)

    render(<Login />)

    // Fill out the form
    await userEvent.type(screen.getByLabelText("Username"), "wronguser")
    await userEvent.type(screen.getByLabelText("Password"), "wrongpass")

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: "Login" }))

    // Check if error message is displayed
    await waitFor(() => {
      expect(screen.getByText("Invalid credentials")).toBeInTheDocument()
    })
  })
})

describe("ListPosts Component", () => {
  // Mock localStorage
  const localStorageMock = (() => {
    let store = {}
    return {
      getItem: jest.fn((key) => store[key] || null),
      setItem: jest.fn((key, value) => {
        store[key] = value.toString()
      }),
      clear: jest.fn(() => {
        store = {}
      }),
    }
  })()

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks()

    // Setup localStorage mock
    Object.defineProperty(window, "localStorage", { value: localStorageMock })

    // Mock console.log to avoid cluttering test output
    jest.spyOn(console, "log").mockImplementation(() => {})
  })

  test("renders loading state initially", () => {
    // Mock axios to delay response
    mockAxios.request.mockImplementation(() => new Promise(() => {}))

    render(<ListPosts />)

    expect(screen.getByText("Loading posts...")).toBeInTheDocument()
  })

  test("renders posts when data is loaded", async () => {
    // Mock successful response with sample posts
    const mockPosts = {
      data: [
          {
            id: 1,
            title: "Test Post 1",
            author: { first_name: "John", last_name: "Doe" },
            created_at: "2023-04-01T12:00:00Z",
            likes: 5,
            dislikes: 2,
          },
          {
            id: 2,
            title: "Test Post 2",
            author: { first_name: "Jane", last_name: "Smith" },
            created_at: "2023-04-02T14:30:00Z",
            likes: 10,
            dislikes: 1,
          }
      ],
    }

    mockAxios.request.mockResolvedValueOnce(mockPosts)

    render(<ListPosts />)

    // Wait for posts to load
    await waitFor(() => {
      expect(screen.getByText("Test Post 1")).toBeInTheDocument()
    })

    expect(screen.getByText("Test Post 2")).toBeInTheDocument()
    expect(screen.getByText("John Doe")).toBeInTheDocument()
    expect(screen.getByText("Jane Smith")).toBeInTheDocument()
  })

  test("handles like button click when user is logged in", async () => {
    // Set token in localStorage to simulate logged in user
    localStorageMock.getItem.mockReturnValue("test-token")

    // Mock initial posts response
    const initialPosts = {
      data: {
        results: [
          {
            id: 1,
            title: "Test Post",
            author: { first_name: "John", last_name: "Doe" },
            created_at: "2023-04-01T12:00:00Z",
            likes: 5,
            dislikes: 2,
          },
        ],
      },
    }

    // Mock response after liking
    const updatedPosts = {
      data: {
        results: [
          {
            id: 1,
            title: "Test Post",
            author: { first_name: "John", last_name: "Doe" },
            created_at: "2023-04-01T12:00:00Z",
            likes: 6,
            dislikes: 2,
            liked: true,
          },
        ],
      },
    }

    mockAxios.request.mockResolvedValueOnce(initialPosts)
    mockAxios.request.mockResolvedValueOnce(updatedPosts)

    render(<ListPosts />)

  })

})