const { getDB } = require('../config/database');
const { ObjectId } = require('mongodb');

class Submission {
  static collection() {
    return getDB().collection('submissions');
  }

  static async create(data) {
    const result = await this.collection().insertOne(data);
    return { ...data, _id: result.insertedId };
  }

  static async findByEmail(email) {
    return await this.collection().findOne({ email });
  }

  static async findAll(limit = 10, skip = 0) {
    return await this.collection().find().skip(skip).limit(limit).toArray();
  }

  static async count() {
    return await this.collection().countDocuments();
  }

  static async findById(id) {
    return await this.collection().findOne({ _id: new ObjectId(id) });
  }
}

module.exports = Submission;
