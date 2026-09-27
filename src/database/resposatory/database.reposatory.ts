import { Model, PopulateOptions } from "mongoose";

type Populate = string | PopulateOptions | (string | PopulateOptions)[];

export class DsataBaseRepository<TRawDoc> {
  constructor(private model: Model<TRawDoc>) {}
  async create(data: TRawDoc) {
    return this.model.create(data);
  }

  async findAll({
    filter,
    select,
    populate,
    lean,
    sort,
    skip,
    limit,
  }: {
    filter?: any;
    select?: string;
    populate?: Populate;
    lean?: boolean;
    sort?: any;
    skip?: number;
    limit?: number;
  }) {
    let query: any = this.model.find(filter || {});
    if (select) {
      query = query.select(select);
    }
    if (populate) {
      query = query.populate(populate);
    }
    if (sort) {
      query = query.sort(sort);
    }
    if (skip) {
      query = query.skip(skip);
    }
    if (limit) {
      query = query.limit(limit);
    }
    if (lean) {
      query = query.lean();
    }
    return query.exec();
  }
  async findbyId({
    id,
    select,
    populate,
    lean,
  }: {
    id: string;
    select?: string;
    populate?: Populate;
    lean?: boolean;
  }) {
    let query: any = this.model.findById(id);
    if (select) {
      query = query.select(select);
    }
    if (populate) {
      query = query.populate(populate);
    }
    if (lean) {
      query = query.lean();
    }
    return query;
  }
  async findOne({
    filter,
    select,
    populate,
    lean,
  }: {
    filter?: any;
    select?: string;
    populate?: Populate;
    lean?: boolean;
  }) {
    let query: any = this.model.findOne(filter || {});
    if (select) {
      query = query.select(select);
    }
    if (populate) {
      query = query.populate(populate);
    }
    if (lean) {
      query = query.lean();
    }
    return query;
  }
  async updateone({ filter, data }: { filter?: any; data?: any }) {
    let query: any = this.model.updateOne(filter, data);
    return query;
  }
  async updateMany({ filter, data }: { filter?: any; data?: any }) {
    let query: any = this.model.updateMany(filter, data);
    return query;
  }
  async deleteOne({ filter }: { filter?: any }) {
    let query: any = this.model.deleteOne(filter);
    return query;
  }
  async deleteMany({ filter }: { filter?: any }) {
    let query: any = this.model.deleteMany(filter);
    return query;
  }
  async count({ filter }: { filter?: any }) {
    return this.model.countDocuments(filter || {});
  }
}
