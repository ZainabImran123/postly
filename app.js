// import { createClient } from '@supabase/supabase-js'

// Create a single supabase client for interacting with your database
var supabase = window.supabase.createClient(
  "https://urhksjbmmesfibcgeeal.supabase.co",
  "sb_publishable__fqO70p_nvCHHAZgdK1jPQ_H3tn8jR3"
);

let edited = false;
let idindex = null;
let email;
let userId;
var cardBg;

async function searchPosts() {

  let searchInput = document.getElementById("searchInput").value;
console.log(searchInput);

  try {

    const { data, error } = await supabase
      .from("Post app")
      .select("*")
      .or(`title.ilike.%${searchInput}%,description.ilike.%${searchInput}%`);

  
    var posts = document.getElementById("posts");
    posts.innerHTML = "";

    data.forEach(post => {

      posts.innerHTML += `
      <div class="card mb-2">
        <div class="card-header">${post.id} ~Post</div>

        <div style="background-image:url(${post.bg_img})" class="card-body">
          <figure>
            <blockquote class="blockquote">
              <p>${post.title}</p>
            </blockquote>

            <figcaption class="blockquote-footer">
              ${post.description}
            </figcaption>
          </figure>
        </div>

        <div class="ms-auto m-2">
          <button
          onclick="editPost(event,${post.id},'${post.description}','${post.title}','${post.bg_img}','${post.user_id}')"
          class="btn btn-success">
          Edit
          </button>

          <button
          onclick="deletePost(event,${post.id})"
          class="btn btn-danger">
          Delete
          </button>
        </div>

      </div>
      `;

    });

    if (!data.length) {
      // posts.innerHTML = "No posts Found";
if (!data.length) {
  posts.innerHTML = `
    <div class="no-post-found">
      <div class="search-icon">
        🔍
      </div>

      <h2>No Posts Found</h2>

      <p>
        Sorry! We couldn't find any posts matching your search.
      </p>

      <button class="search-again-btn" onclick="document.getElementById('searchInput').value=''; location.reload();">
        Show All Posts
      </button>
    </div>
  `;
  return;
}
    }

  } catch (error) {

    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: error.message
    });

  }

}



window.onload = async function () {

  try {

    const { data, error } = await supabase
      .from("Post app")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      Swal.fire({
        icon: "error",
        title: "Loading Failed",
        text: error.message
      });
      return;
    }

    var posts = document.getElementById("posts");
    posts.innerHTML = "";

    data.forEach(post => {

      posts.innerHTML += `
      <div class="card mb-2">

        <div class="card-header">
          ${post.id}: @${post.email}
        </div>

        <div style="background-image:url(${post.bg_img})" class="card-body">

          <figure>

            <blockquote class="blockquote">
              <p>${post.title}</p>
            </blockquote>

            <figcaption class="blockquote-footer">
              ${post.description}
            </figcaption>

          </figure>

        </div>

        <div class="ms-auto m-2">

          <button
          onclick="editPost(event,${post.id},'${post.description}','${post.title}','${post.bg_img}','${post.user_id}')"
          class="btn btn-success">
          Edit
          </button>

          <button
          onclick="deletePost(event,${post.id})"
          class="btn btn-danger">
          Delete
          </button>

        </div>

      </div>
      `;

    });

  } catch (error) {

    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: error.message
    });

  }

};



async function deletePost(event, id) {

  let postUserId;

  try {

    const { data: { user }, error: userError } =
      await supabase.auth.getUser();

    if (userError || !user) {

      Swal.fire({
        icon: "warning",
        title: "Login Required",
        text: "Please login first."
      });

      return;
    }

    userId = user.id;

    const { data, error } = await supabase
      .from("Post app")
      .select("user_id")
      .eq("id", id)
      .single();

    if (error) {

      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message
      });

      return;
    }

    postUserId = data.user_id;

    if (postUserId !== userId) {

      Swal.fire({
        icon: "error",
        title: "Access Denied",
        text: "This post doesn't belong to you."
      });

      return;
    }

  } catch (error) {

    Swal.fire({
      icon: "error",
      title: "Error",
      text: error.message
    });

    return;
  }

  const result = await Swal.fire({
    title: "Delete Post?",
    text: "You won't be able to recover it!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, Delete",
    cancelButtonText: "Cancel"
  });

  if (!result.isConfirmed) return;

  try {

    const { error } = await supabase
      .from("Post app")
      .delete()
      .eq("id", id);

    if (error) {

      Swal.fire({
        icon: "error",
        title: "Delete Failed",
        text: error.message
      });

      return;
    }

    Swal.fire({
      icon: "success",
      title: "Deleted Successfully"
    });

    var card = event.target.parentNode.parentNode;
    card.remove();

  } catch (error) {

    Swal.fire({
      icon: "error",
      title: "Error",
      text: error.message
    });

  }

}


async function editPost(event, id, desc, title, bg_img, post_id) {

  try {

    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      Swal.fire({
        icon: "warning",
        title: "Login Required",
        text: "Please login first."
      });
      return;
    }

    userId = user.id;

    if (post_id !== userId) {
      Swal.fire({
        icon: "error",
        title: "Access Denied",
        text: "You are not allowed to edit this post!"
      });
      return;
    }

  } catch (error) {

    Swal.fire({
      icon: "error",
      title: "Error",
      text: error.message
    });

    return;
  }

  document.getElementById("title").value = title;
  document.getElementById("description").value = desc;

  cardBg = bg_img;

  edited = true;
  idindex = id;

  let postBtn = document.getElementById("postBtn");
  postBtn.innerHTML = "Update Post";
}



async function post() {

  var title = document.getElementById("title");
  var description = document.getElementById("description");

  if (title.value.trim() && description.value.trim()) {

    try {

      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        Swal.fire({
          icon: "warning",
          title: "Login Required",
          text: "Please login first."
        });
        return;
      }

      email = user.email;
      userId = user.id;

    } catch (error) {

      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message
      });

      return;
    }

    if (edited) {

      try {

        const { error } = await supabase
          .from("Post app")
          .update({
            title: title.value,
            description: description.value,
            bg_img: cardBg
          })
          .eq("id", idindex);

        if (error) {

          Swal.fire({
            icon: "error",
            title: "Update Failed",
            text: error.message
          });

          return;
        }

        Swal.fire({
          icon: "success",
          title: "Post Updated Successfully"
        });

        edited = false;
        idindex = null;

        document.getElementById("postBtn").innerHTML = "Post";

      } catch (error) {

        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message
        });

        return;
      }

    } else {

      try {

        const { error } = await supabase
          .from("Post app")
          .insert({
            title: title.value,
            description: description.value,
            bg_img: cardBg,
            email: email,
            user_id: userId
          });

        if (error) {

          Swal.fire({
            icon: "error",
            title: "Post Failed",
            text: error.message
          });

          return;
        }

        Swal.fire({
          icon: "success",
          title: "Post Created Successfully"
        });

      } catch (error) {

        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message
        });

        return;
      }

    }

    setTimeout(() => {
      location.reload();
    }, 1000);

  } else {

    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Title & Description can't be empty!"
    });

  }

  title.value = "";
  description.value = "";

}



function selectImg(src) {

  cardBg = src;

  var bgImg = document.getElementsByClassName("bgImg");

  for (var i = 0; i < bgImg.length; i++) {
    bgImg[i].className = "bgImg";
  }

  event.target.classList.add("selectedImg");

}