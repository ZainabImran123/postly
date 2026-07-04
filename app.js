var supabase = window.supabase.createClient(
  'https://urhksjbmmesfibcgeeal.supabase.co',
  'sb_publishable__fqO70p_nvCHHAZgdK1jPQ_H3tn8jR3'
);

let edited = false;
let idindex = null;
var cardBg;

// ================= SEARCH POSTS =================

async function searchPosts() {

  let searchInput = document.getElementById("searchInput").value;
  let posts = document.getElementById("posts");

  try {

    const { data, error } = await supabase
      .from('Post app')
      .select('*')
      .or(`title.ilike.%${searchInput}%,description.ilike.%${searchInput}%`);

    if (error) {
      Swal.fire({
        icon: "error",
        title: "Database Error",
        text: error.message
      });
      return;
    }

    posts.innerHTML = "";

    if (!data.length) {

      posts.innerHTML = `
        <div class="no-post-card">
          <div class="empty-icon">📭</div>
          <h2>No Posts Found</h2>
          <p>There are no posts matching your search.</p>
        </div>
      `;

      Swal.fire({
        icon: "info",
        title: "No Posts Found",
        text: "There are no posts matching your search."
      });

      return;
    }

    data.forEach(post => {

      posts.innerHTML += `
      <div class="card mb-2">

        <div class="card-header">
          ${post.id} ~ Post
        </div>

        <div style="background-image:url(${post.bg_img})"
        class="card-body">

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
          onclick="editPost(event,${post.id},'${post.description}','${post.title}','${post.bg_img}')"
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

  }

  catch (err) {

    Swal.fire({
      icon: "error",
      title: "Oops!",
      text: err.message
    });

  }

}

// ================= PAGE LOAD =================

window.onload = async function () {

  try {

    const { data, error } = await supabase
      .from('Post app')
      .select("*")
      .order('id', { ascending: false });

    if (error) {

      Swal.fire({
        icon: "error",
        title: "Database Error",
        text: error.message
      });

      return;
    }

    let posts = document.getElementById("posts");

    posts.innerHTML = "";

    data.forEach(post => {

      posts.innerHTML += `

      <div class="card mb-2">

        <div class="card-header">
          ${post.id} ~ Post
        </div>

        <div
        style="background-image:url(${post.bg_img})"
        class="card-body">

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
          onclick="editPost(event,${post.id},'${post.description}','${post.title}','${post.bg_img}')"
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

  }

  catch (err) {

    Swal.fire({
      icon: "error",
      title: "Oops!",
      text: err.message
    });

  }

}


// ================= DELETE POST =================

async function deletePost(event, id) {

  const result = await Swal.fire({
    title: "Delete Post?",
    text: "You won't be able to recover this post!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes, delete it!"
  });

  if (!result.isConfirmed) return;

  try {

    const { error } = await supabase
      .from('Post app')
      .delete()
      .eq('id', id);

    if (error) {
      Swal.fire({
        icon: "error",
        title: "Delete Failed",
        text: error.message
      });
      return;
    }

    var card = event.target.parentNode.parentNode;
    card.remove();

    Swal.fire({
      icon: "success",
      title: "Deleted!",
      text: "Post deleted successfully.",
      timer: 1500,
      showConfirmButton: false
    });

  } catch (err) {

    Swal.fire({
      icon: "error",
      title: "Oops!",
      text: err.message
    });

  }

}

// ================= EDIT POST =================

function editPost(event, id, desc, title, bg_img) {

  document.getElementById("title").value = title;
  document.getElementById("description").value = desc;

  cardBg = bg_img;

  edited = true;
  idindex = id;

  document.getElementById("postBtn").innerHTML = "Update Post";
}

// ================= ADD / UPDATE POST =================

async function post() {

  var title = document.getElementById("title");
  var description = document.getElementById("description");

  if (!title.value.trim() || !description.value.trim()) {

    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Title & Description can't be empty!"
    });

    return;
  }

  try {

    if (edited) {

      const { error } = await supabase
        .from('Post app')
        .update({
          title: title.value,
          description: description.value,
          bg_img: cardBg
        })
        .eq('id', idindex);

      if (error) {
        Swal.fire({
          icon: "error",
          title: "Update Failed",
          text: error.message
        });
        return;
      }

      edited = false;
      idindex = null;

      document.getElementById("postBtn").innerHTML = "Post";

      await Swal.fire({
        icon: "success",
        title: "Updated!",
        text: "Post updated successfully.",
        timer: 1500,
        showConfirmButton: false
      });

    } else {

      const { error } = await supabase
        .from('Post app')
        .insert({
          title: title.value,
          description: description.value,
          bg_img: cardBg
        });

      if (error) {

        Swal.fire({
          icon: "error",
          title: "Post Failed",
          text: error.message
        });

        return;
      }

      await Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Post added successfully.",
        timer: 1500,
        showConfirmButton: false
      });

    }

    title.value = "";
    description.value = "";

    location.reload();

  } catch (err) {

    Swal.fire({
      icon: "error",
      title: "Oops!",
      text: err.message
    });

  }

}

// ================= SELECT IMAGE =================

function selectImg(src) {

  cardBg = src;

  var bgImg = document.getElementsByClassName("bgImg");

  for (var i = 0; i < bgImg.length; i++) {
    bgImg[i].className = "bgImg";
  }

  event.target.classList.add("selectedImg");

}