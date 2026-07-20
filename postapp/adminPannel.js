// =========================================================
// SUPABASE CLIENT & DOM INITIALIZATION
// =========================================================
const SUPABASE_URL = "https://urhksjbmmesfibcgeeal.supabase.co";
const SUPABASE_SERVICE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyaGtzamJtbWVzZmliY2dlZWFsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTY4MDMwMiwiZXhwIjoyMDk3MjU2MzAyfQ.P22S0X5gBzrW2UPA3WH8lcg81hPk1ghhma9KUG9Gm7o";

var supabaseAdmin = window.supabase.createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
var supabase = supabaseAdmin;

// Helper function for toast notifications
function showToast(icon, title, text = "") {
  return Swal.fire({
    icon: icon,
    title: title,
    text: text,
    timer: 2000,
    showConfirmButton: false
  });
}

// 🔒 Check Admin Rights
async function checkAdmin() {
  const { data: { user }, error } = await supabase.auth.getUser();

  if (!user) {
    window.location.href = "/";
    return;
  }

  if (user.user_metadata?.role !== "admin") {
    await Swal.fire({
      icon: "error",
      title: "Access Denied",
      text: "You do not have permission to access the admin panel."
    });
    window.location.href = "/postapp/dashboard.html";
  }
}

checkAdmin();

// 📊 Load Dashboard Stats
async function loadStats() {
  // Total posts
  const { data: posts } = await supabase.from("Post app").select("*");
  const totalPostsEl = document.getElementById("totalPosts");
  if (posts && totalPostsEl) {
    totalPostsEl.innerText = posts.length;
  }

  // Total users
  const totalUsersEl = document.getElementById("totalUsers");
  if (typeof supabaseAdmin !== "undefined" && totalUsersEl) {
    try {
      const { data, error } = await supabaseAdmin.auth.admin.listUsers();
      if (error) throw error;
      totalUsersEl.innerText = data.users.length;
    } catch (error) {
      console.error("Error fetching users count:", error);
    }
  }
}

loadStats();

// 🏠 Show Dashboard View
function showDashboard() {
  const mainContent = document.getElementById("mainContent");
  if (!mainContent) return;

  mainContent.innerHTML = `
    <h2>Posts</h2>
    <div id="posts"></div>
  `;
  loadPosts();
}

// 📄 Load All Posts
async function loadPosts() {
  try {
    const { data, error } = await supabase
      .from("Post app")
      .select("*")
      .order("id", { ascending: false });

    const postsContainer = document.getElementById("posts");
    if (!postsContainer) return;
    postsContainer.innerHTML = "";

    if (error) {
      console.error("Error fetching posts:", error);
      showToast("error", "Error", "Failed to fetch posts.");
      return;
    }

    if (!data || data.length === 0) {
      postsContainer.innerHTML = "<h4>No posts available</h4>";
      return;
    }

    data.forEach((post) => {
      // Build public URL using post-images bucket
      let finalImageUrl = "";
      const rawImage = post.img_url || post.image_url || post.image;

      if (rawImage) {
        if (rawImage.startsWith("http://") || rawImage.startsWith("https://")) {
          finalImageUrl = rawImage;
        } else {
          const { data: publicUrlData } = supabase.storage.from("post-images").getPublicUrl(rawImage);
          finalImageUrl = publicUrlData.publicUrl;
        }
      }

      postsContainer.innerHTML += `
        <div class="post card m-2 p-3 shadow-sm" id="post-card-${post.id}">
            <h3>${post.title || "Untitled Post"}</h3>
            <p>${post.description || ""}</p>
            ${finalImageUrl
          ? `<div class="mb-2">
                     <img 
                       src="${finalImageUrl}" 
                       width="200" 
                       style="display:block; border-radius: 5px;" 
                       onerror="this.parentElement.style.display='none'" 
                     />
                   </div>`
          : ""
        }
            <div>
              <button onclick="deletePost(${post.id})" class="btn btn-danger btn-sm">Delete</button>
            </div>
        </div>
      `;
    });
  } catch (err) {
    console.error("Unexpected error in loadPosts:", err);
  }
}

loadPosts();

// 🗑 Delete Post Function (Shared between views)
async function deletePost(id, userIdFilter = null) {
  const result = await Swal.fire({
    title: "Are you sure?",
    text: "This post will be permanently deleted!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#dc3545",
    cancelButtonColor: "#6c757d",
    confirmButtonText: "Yes, delete it!"
  });

  if (!result.isConfirmed) return;

  try {
    Swal.fire({
      title: "Deleting...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    const { error } = await supabase.from("Post app").delete().eq("id", id);

    if (error) throw error;

    showToast("success", "Deleted!", "Post deleted successfully.");

    // Refresh view
    if (userIdFilter) {
      viewUserPosts(userIdFilter);
    } else {
      loadPosts();
    }
    loadStats();

  } catch (err) {
    console.error("Delete Error:", err);
    Swal.fire({
      icon: "error",
      title: "Error Deleting Post",
      text: err.message || "Could not delete the post."
    });
  }
}

// 👤 View User Posts (With Image + Delete Button)
async function viewUserPosts(userId) {
  const mainContent = document.getElementById("mainContent");
  if (!mainContent) return;

  try {
    Swal.fire({
      title: "Loading User Posts...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    const { data, error } = await supabase
      .from("Post app")
      .select("*")
      .eq("user_id", userId)
      .order("id", { ascending: false });

    Swal.close();

    if (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Failed to load posts",
        text: error.message
      });
      return;
    }

    mainContent.innerHTML = `
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h2>User Posts</h2>
        <button onclick="loadUsers()" class="btn btn-secondary btn-sm">← Back to Users</button>
      </div>
      <div id="userPostsList"></div>
    `;

    const postsList = document.getElementById("userPostsList");

    if (!data || data.length === 0) {
      postsList.innerHTML = "<p class='text-muted'>No posts found for this user.</p>";
      return;
    }

    data.forEach((post) => {
      // Build public URL using post-images bucket
      let finalImageUrl = "";
      const rawImage = post.img_url || post.image_url || post.image;

      if (rawImage) {
        if (rawImage.startsWith("http://") || rawImage.startsWith("https://")) {
          finalImageUrl = rawImage;
        } else {
          const { data: publicUrlData } = supabase.storage.from("post-images").getPublicUrl(rawImage);
          finalImageUrl = publicUrlData.publicUrl;
        }
      }

      postsList.innerHTML += `
        <div class="post-card card m-2 p-3 shadow-sm" id="post-card-${post.id}">
            <h3>${post.title || "Untitled Post"}</h3>
            <p>${post.description || ""}</p>
            
            ${finalImageUrl
          ? `<div class="mb-2">
                     <img 
                       src="${finalImageUrl}" 
                       alt="Post Image" 
                       style="max-width: 300px; width: 100%; max-height: 250px; object-fit: cover; display: block; border-radius: 5px; border: 1px solid #ddd;" 
                       onerror="this.parentElement.style.display='none';" 
                     />
                   </div>`
          : ""
        }

            <div class="mt-2">
              <button onclick="deletePost(${post.id}, '${userId}')" class="btn btn-danger btn-sm">Delete</button>
            </div>
        </div>
      `;
    });

  } catch (err) {
    console.error("Error in viewUserPosts:", err);
  }
}

// 👥 Load Users
async function loadUsers() {
  const mainContent = document.getElementById("mainContent");
  if (!mainContent) return;

  mainContent.innerHTML = `
    <h2 class="page-title">Manage Users</h2>
    <table class="users-table table">
        <thead>
            <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody id="usersTableBody"></tbody>
    </table>
  `;

  if (typeof supabaseAdmin === "undefined") {
    console.warn("Admin management requires Supabase config.");
    return;
  }

  try {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers();
    if (error) throw error;

    const tbody = document.getElementById("usersTableBody");
    if (!tbody) return;

    if (!data.users || data.users.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-center">No users registered yet.</td></tr>';
      return;
    }

    data.users.forEach((user, index) => {
      tbody.innerHTML += `
        <tr>
            <td>${index + 1}</td>
            <td>${user.user_metadata?.name || user.name || "-"}</td>
            <td>${user.email || "-"}</td>
            <td>${user.phone || "-"}</td>
            <td class="action-buttons">
                <button onclick="viewUserPosts('${user.id}')" class="btn btn-info btn-sm">Posts</button>
                <button onclick="deleteUser('${user.id}')" class="btn btn-danger btn-sm">Delete</button>
            </td>
        </tr>
      `;
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    Swal.fire({
      icon: "error",
      title: "Error Loading Users",
      text: error.message
    });
  }
}

// ❌ Delete User
async function deleteUser(userId) {
  const result = await Swal.fire({
    title: "Delete User?",
    text: "Are you sure you want to delete this user? This will also remove all their posts!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#dc3545",
    cancelButtonColor: "#6c757d",
    confirmButtonText: "Yes, delete user!"
  });

  if (!result.isConfirmed) return;

  try {
    Swal.fire({
      title: "Deleting User...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    // 1. Delete user posts from "Post app"
    await supabase.from("Post app").delete().eq("user_id", userId);

    // 2. Delete user account using Admin Auth API
    if (typeof supabaseAdmin !== "undefined") {
      const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
      if (error) throw error;
    }

    showToast("success", "User Deleted!", "User and all associated posts were removed.");

    await loadUsers();
    await loadStats();

  } catch (error) {
    console.error("Unexpected error in deleteUser:", error);
    Swal.fire({
      icon: "error",
      title: "Deletion Failed",
      text: error.message || "An unexpected error occurred."
    });
  }
}

// 🚪 Logout
async function logout() {
  const result = await Swal.fire({
    title: "Logout?",
    text: "Are you sure you want to sign out?",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Yes, Logout"
  });

  if (result.isConfirmed) {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      window.location.href = "/postapp/admin.html";
    }
  }
}

// 🌐 Export functions to Window Object for HTML click handlers
window.showDashboard = showDashboard;
window.loadPosts = loadPosts;
window.loadUsers = loadUsers;
window.viewUserPosts = viewUserPosts;
window.deletePost = deletePost;
window.deleteUser = deleteUser;
window.logout = logout;