// Blog Class - เพิ่มฟีเจอร์ Tags และ LocalStorage
class Blog {
    constructor(id, title, content, tags) {
      this.id = id;
      this.title = title;
      this.content = content;
      this.tags = tags || [];
      this.createdDate = new Date();
      this.updatedDate = new Date();
    }
  
    update(title, content, tags) {
      this.title = title;
      this.content = content;
      this.tags = tags;
      this.updatedDate = new Date();
    }
  
    getFormattedDate() {
      return this.updatedDate.toLocaleString("th-TH", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  }
  
  // BlogManager Class - จัดการ LocalStorage
  class BlogManager {
    constructor() {
      // แปลง Plain Object เป็น Instance ของ Blog
      this.blogs = JSON.parse(localStorage.getItem("blogs"))?.map(blogData => 
        new Blog(blogData.id, blogData.title, blogData.content, blogData.tags)
      ) || [];
    }
  
  
    saveToLocalStorage() {
      localStorage.setItem("blogs", JSON.stringify(this.blogs));
    }
  
    addBlog(title, content, tags) {
      const blog = new Blog(Date.now(), title, content, tags);
      this.blogs.push(blog);
      this.sortBlogs();
      this.saveToLocalStorage();
      return blog;
    }
  
    updateBlog(id, title, content, tags) {
      const blog = this.getBlog(id);
      if (blog) {
        blog.update(title, content, tags);
        this.sortBlogs();
        this.saveToLocalStorage();
      }
      return blog;
    }
  
    deleteBlog(id) {
      this.blogs = this.blogs.filter((blog) => blog.id !== id);
      this.saveToLocalStorage();
    }
  
    getBlog(id) {
      return this.blogs.find((blog) => blog.id === id);
    }
  
    sortBlogs() {
      this.blogs.sort((a, b) => b.updatedDate - a.updatedDate);
    }
  }
  
  // UI Class - อัปเดตให้รองรับ Tags และ Filter
  class BlogUI {
    constructor(blogManager) {
      this.blogManager = blogManager;
      this.initElements();
      this.initEventListeners();
      this.render();
    }
  
    initElements() {
      this.form = document.getElementById("blog-form");
      this.titleInput = document.getElementById("title");
      this.contentInput = document.getElementById("content");
      this.tagsInput = document.getElementById("tags");
      this.editIdInput = document.getElementById("edit-id");
      this.formTitle = document.getElementById("form-title");
      this.cancelBtn = document.getElementById("cancel-btn");
      this.blogList = document.getElementById("blog-list");
      this.tagFilter = document.getElementById("tag-filter");
    }
  
    initEventListeners() {
      this.form.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleSubmit();
      });
      this.cancelBtn.addEventListener("click", () => {
        this.resetForm();
      });
      this.tagFilter.addEventListener("input", () => {
        this.render();
      });
    }
  
    handleSubmit() {
      const title = this.titleInput.value.trim();
      const content = this.contentInput.value.trim();
      const tags = this.tagsInput.value.split(",").map(tag => tag.trim());
      const editId = parseInt(this.editIdInput.value);
  
      if (title && content) {
        if (editId) {
          this.blogManager.updateBlog(editId, title, content, tags);
        } else {
          this.blogManager.addBlog(title, content, tags);
        }
        this.resetForm();
        this.render();
      }
    }
  
    render() {
      const filterTag = this.tagFilter.value.trim().toLowerCase();
      this.blogList.innerHTML = this.blogManager.blogs
        .filter(blog => filterTag === "" || blog.tags.includes(filterTag))
        .map(blog => `
          <div class="blog-post">
            <h2 class="blog-title">${blog.title}</h2>
            <div class="blog-date">อัปเดตเมื่อ: ${blog.getFormattedDate()}</div>
            <div class="blog-content">${blog.content.replace(/\n/g, "<br>")}</div>
            <div class="blog-tags">Tags: ${blog.tags.join(", ")}</div>
            <div class="blog-actions">
              <button class="btn-edit" onclick="blogUI.editBlog(${blog.id})">แก้ไข</button>
              <button class="btn-delete" onclick="blogUI.deleteBlog(${blog.id})">ลบ</button>
            </div>
          </div>`
        ).join("");
    }
  
    resetForm() {
      this.form.reset();
      this.editIdInput.value = "";
      this.formTitle.textContent = "เขียนบล็อกใหม่";
      this.cancelBtn.classList.add("hidden");
    }
  }
  
  const blogManager = new BlogManager();
  const blogUI = new BlogUI(blogManager);
  
  