var supabase = window.supabase.createClient("https://urhksjbmmesfibcgeeal.supabase.co","sb_publishable__fqO70p_nvCHHAZgdK1jPQ_H3tn8jR3");


async function checkAdmin() {

  const { data: { user }, error } = await supabase.auth.getUser();

  if (!user) {
    window.location.href = "/";
    return;
  }

  if (user.user_metadata.role !== "admin") {
    alert("Access Denied");
    window.location.href = "/dashboard.html";
  }

}

checkAdmin();


