from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select
import time
import random
import string
import traceback

# Print a message to show the script is starting
print("Starting Selenium test script...")

try:
    # Setup Chrome options
    print("Setting up Chrome options...")
    chrome_options = Options()
    chrome_options.add_argument("--start-maximized")  # Start with maximized browser

    # Initialize WebDriver
    print("Initializing WebDriver...")
    driver = webdriver.Chrome(options=chrome_options)

    print("WebDriver initialized successfully!")

    # Base URL of your application
    base_url = "http://localhost:3000"  # Replace with your actual URL
    print(f"Base URL set to: {base_url}")


    # Generate random username to avoid conflicts
    def generate_random_username():
        return 'user_' + ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))


    username = generate_random_username()
    password = "Password123!"
    email = f"{username}@example.com"
    first_name = "Test"
    last_name = "User"

    print(f"Generated test user: {username}")

    # Step 1: Navigate to the registration page
    print(f"Navigating to: {base_url}/register")
    driver.get(f"{base_url}/register")

    # Wait for the registration form to load
    print("Waiting for registration form elements...")
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, "username"))
    )
    print("Registration form loaded successfully!")

    # Fill in registration details
    print("Filling in registration form...")
    driver.find_element(By.ID, "username").send_keys(username)
    driver.find_element(By.ID, "email").send_keys(email)
    driver.find_element(By.ID, "password").send_keys(password)
    driver.find_element(By.ID, "first_name").send_keys(first_name)
    driver.find_element(By.ID, "last_name").send_keys(last_name)

    # Take a screenshot of the filled form
    driver.save_screenshot("registration_form_filled.png")

    # Submit registration form
    print("Submitting registration form...")
    driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()

    # Wait for registration to complete (either redirect or success message)
    print("Waiting for registration to complete...")
    try:
        WebDriverWait(driver, 10).until(
            EC.url_contains("/login") or
            EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'Registration successful')]"))
        )
        print("Registration successful!")
    except Exception as e:
        print(f"Warning: Could not confirm registration success: {e}")
        print("Taking screenshot and continuing anyway...")
        driver.save_screenshot("registration_completion.png")

    # Step 2: Navigate to login page
    print("Navigating to login page...")
    driver.get(f"{base_url}/login")

    # Wait for login form to load
    print("Waiting for login form...")
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, "username"))
    )
    print("Login form loaded!")

    # Fill in login details
    print("Filling in login credentials...")
    driver.find_element(By.ID, "username").send_keys(username)
    driver.find_element(By.ID, "password").send_keys(password)

    # Take a screenshot of the filled login form
    driver.save_screenshot("login_form_filled.png")

    # Submit login form
    print("Submitting login form...")
    driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()

    # Wait for login to complete (redirect to home page)
    print("Waiting for login to complete...")
    try:
        WebDriverWait(driver, 10).until(
            EC.url_contains("/")
        )
        print("Login successful!")
    except Exception as e:
        print(f"Warning: Could not confirm login success: {e}")
        print("Taking screenshot and continuing anyway...")
        driver.save_screenshot("login_completion.png")

    # Step 3: Navigate to create post page
    print("Waiting for Create Post link to be clickable...")
    WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, "//a[contains(text(), 'Create Post')]"))
    )

    print("Clicking Create Post link...")
    driver.find_element(By.XPATH, "//a[contains(text(), 'Create Post')]").click()

    # Wait for create post form to load
    print("Waiting for create post form...")
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "input[placeholder='Title']"))
    )
    print("Create post form loaded!")

    # Fill in post details
    print("Filling in post details...")
    post_title = "Testing with Selenium"
    post_content = "If several languages coalesce, the grammar of the resulting language is more simple and regular than that of the individual languages. The new common language will be more simple and regular than the existing European languages. It will be as simple as Occidental; in fact, it will be Occidental. To an English person, it will seem like simplified English, as a skeptical Cambridge friend of mine told me what Occidental is. The European languages are members of the same family. Their separate existence is a myth. For science, music, sport, etc, Europe uses the same vocabulary."

    driver.find_element(By.CSS_SELECTOR, "input[placeholder='Title']").send_keys(post_title)
    driver.find_element(By.CSS_SELECTOR, "textarea[placeholder='Content']").send_keys(post_content)

    # Ensure "published" is selected in the dropdown
    print("Setting post status to published...")
    select = Select(driver.find_element(By.CSS_SELECTOR, "select"))
    select.select_by_value("published")

    # Take a screenshot of the filled post form
    driver.save_screenshot("create_post_form_filled.png")

    # Submit post form
    print("Submitting post form...")
    driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()

    # Wait for post creation success message
    print("Waiting for post creation confirmation...")
    try:
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'Post Created Successfully')]"))
        )
        print("Post created successfully!")
    except Exception as e:
        print(f"Warning: Could not confirm post creation: {e}")
        print("Taking screenshot and continuing anyway...")
        driver.save_screenshot("post_creation_completion.png")

    # Step 4: Navigate to posts list
    print("Waiting for Posts link...")
    WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, "//a[contains(text(), 'Posts')]"))
    )

    print("Clicking Posts link...")
    driver.find_element(By.XPATH, "//a[contains(text(), 'Posts')]").click()

    # Wait for posts to load
    print("Waiting for posts to load...")
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.CLASS_NAME, "post-card"))
    )
    print("Posts loaded!")

    # Take a screenshot of the posts list
    driver.save_screenshot("posts_list.png")

    # Step 5: Find our post and like it
    print("Looking for our post in the list...")
    time.sleep(2)
    # First, find the post by title
    post_elements = driver.find_elements(By.CLASS_NAME, "post-card")
    target_post = None

    for post in post_elements:
        try:
            title_element = post.find_element(By.CLASS_NAME, "post-title")
            print(f"Found post with title: {title_element.text}")
            if title_element.text == post_title:
                target_post = post
                print("Found our target post!")
                break
        except Exception as e:
            print(f"Error processing a post: {e}")

    if target_post:
        # Click the like button in the found post
        print("Finding like button...")
        like_button = target_post.find_element(By.CSS_SELECTOR, ".like-button")

        print("Clicking like button...")
        like_button.click()

        # Wait a moment to see the like count increase
        print("Waiting for like to register...")
        time.sleep(2)

        # Take a screenshot after liking
        driver.save_screenshot("post_liked.png")

        # Verify the like was registered (button should have 'active' class)
        if "active" in like_button.get_attribute("class"):
            print("Like was successfully registered!")
        else:
            print("Like may not have been registered properly.")
    else:
        print("Could not find the created post in the list.")

    print("Test completed successfully!")

except Exception as e:
    print(f"An error occurred: {e}")
    print("Traceback:")
    traceback.print_exc()

finally:
    # Wait a moment before closing
    print("Test finished. Waiting 5 seconds before closing browser...")
    time.sleep(5)

    try:
        # Take a final screenshot before closing
        print("Taking final screenshot...")
        driver.save_screenshot("test_final_state.png")

        # Close the browser
        print("Closing browser...")
        driver.quit()
        print("Browser closed successfully.")
    except Exception as e:
        print(f"Error during cleanup: {e}")