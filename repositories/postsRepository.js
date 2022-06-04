const { Post } = require("../models");

class PostsRepository {
  static async create({ user_id, title, description, picture }) {
    const createdPost = Post.create({
      user_id,
      title,
      description,
      picture,
    });

    return createdPost;
  }

  static async getByID({ id }) {
    const getPost = await Post.findOne({ where: { id } });

    return getPost;
  }

  static async deleteByID({ id }) {
    const deletePost = await Post.destroy({ where: { id } });

    return deletePost;
  }

  static async updateByID({ id, title, description, picture }) {
    const deletePost = await Post.update(
      {
        title,
        description,
        picture,
      },
      { where: { id } }
    );

    return deletePost;
  }

  static async getAll() {
    const getAll = await Post.findAll();

    return getAll;
  }
}

module.exports = PostsRepository;
