"use strict";

let logger = require("../../../core/logger");
let config = require("../../../config");
let C = require("../../../core/constants");

let _ = require("lodash");

let HexoPost = require("./models/hexopost");
let slug = require("../../../core/libs/slug");

module.exports = {
  settings: {
    name: "hexoposts",
    version: 1,
    namespace: "hexoposts",
    rest: true,
    ws: true,
    graphql: true,
    permission: C.PERM_LOGGEDIN,
    role: "user",
    collection: HexoPost,
    modelPropFilter:
      "code title excerpt createdAt updatedAt votes voters views author more comments permalink link tags categories slug thumbnailImageUrl thumbnailImagePosition coverImage coverCaption autoThumbnailImage content day month year",

    modelPopulates: {
      author: { service: "persons" },
      voters: { service: "persons" },
      tags: { service: "tags", ref: ["id", "tag_id"] },
      categories: { service: "categories", ref: ["code", "category_id"] }
    }
  },

  actions: {
    find: {
      cache: false,
      permission: C.PERM_PUBLIC,
      mapping: {
        path: "/",
        method: "get"
      },
      handler(ctx) {
        logger.info("Filtering received ", ctx.params.filter);
        logger.info("Params received ", ctx.params);
        let filter = ctx.params;
        if (ctx.params.filter == "my") filter.author = ctx.user.id;
        else if (ctx.params.author != null) {
          filter.author = this.personService.decodeID(ctx.params.author);
        }

        let query = HexoPost.find(filter);

        return ctx
          .queryPageSort(query)
          .exec()
          .then(docs => {
            return this.toJSON(docs);
          })
          .then(json => {
            return this.populateModels(json);
          });
      }
    },

    // return a model by ID
    get: {
      cache: true, // if true, we don't increment the views!
      permission: C.PERM_PUBLIC,
      mapping: {
        path: "/:id",
        method: "get"
      },
      handler(ctx) {
        ctx.assertModelIsExist(ctx.t("app:HexoPostNotFound"));

        return HexoPost.findByIdAndUpdate(ctx.modelID, { $inc: { views: 1 } })
          .exec()
          .then(doc => {
            return this.toJSON(doc);
          })
          .then(json => {
            return this.populateModels(json);
          });
      }
    },

    create: {
      mapping: {
        path: "/",
        method: "post"
      },
      handler(ctx) {
        this.validateParams(ctx, true);

        console.info("Invocation of the post creation");

        let postData = ctx.params;
        postData.author = ctx.user.id;
        postData.slug = slug.slugIfMissing(postData.title, postData.slug);

        let post = new HexoPost(postData);

        return post
          .save()
          .then(doc => {
            return this.toJSON(doc);
          })
          .then(json => {
            return this.populateModels(json);
          })
          .then(json => {
            this.notifyModelChanges(ctx, "created", json);
            return json;
          });
      }
    },

    update: {
      permission: C.PERM_OWNER,
      handler(ctx) {
        ctx.assertModelIsExist(ctx.t("app:HexoPostNotFound"));
        this.validateParams(ctx);

        return this.collection
          .findById(ctx.modelID)
          .exec()
          .then(doc => {
            //TODO:: fill the doc
            // postData.slug = slug.slugIfMissing(postData.title, postData.slug);
            if (ctx.params.title != null) doc.title = ctx.params.title;

            if (ctx.params.content != null) doc.content = ctx.params.content;

            doc.updatedAt = Date.now();
            return doc.save();
          })
          .then(doc => {
            return this.toJSON(doc);
          })
          .then(json => {
            return this.populateModels(json);
          })
          .then(json => {
            this.notifyModelChanges(ctx, "updated", json);
            return json;
          });
      }
    },

    remove: {
      permission: C.PERM_OWNER,
      handler(ctx) {
        ctx.assertModelIsExist(ctx.t("app:HexoPostNotFound"));

        return HexoPost.remove({ _id: ctx.modelID })
          .then(() => {
            return ctx.model;
          })
          .then(json => {
            this.notifyModelChanges(ctx, "removed", json);
            return json;
          });
      }
    },

    removeAll: {
      permission: C.PERM_LOGGEDIN,
      handler(ctx) {
        return this.collection
          .remove({})
          .then(() => {
            return ctx.model;
          })
          .then(json => {
            this.notifyModelChanges(ctx, "removedAll", json);
            return json;
          });
      }
    },
    archives: {
      permission: C.PERM_PUBLIC,
      cache: true, // if true, we don't increment the views!
      handler(ctx) {
        const pipeline = [];

        pipeline.push({
          $project: {
            _id: 1,
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
            createdAt: 1,
            updatedAt: 1,
            title: 1,
            slug: 1,
            excerpt: 1,
            votes: 1,
            voters: 1,
            views: 1,
            thumbnailImageUrl: 1,
            thumbnailImagePosition: 1,
            coverImage: 1,
            coverCaption: 1,
            autoThumbnailImage: 1
          }
        });

        if (ctx.params.year && ctx.params.month) {
          const filterDate = {
            year: parseInt(ctx.params.year),
            month: parseInt(ctx.params.month)
          };
          pipeline.push({ $match: filterDate });
        }

        if (
          ctx.params.aggregate === undefined ||
          parseInt(ctx.params.aggregate) === 1
        ) {
          logger.info("Aggregating informations");
          pipeline.push({
            $group: {
              _id: {
                year: { $year: "$createdAt" },
                month: { $month: "$createdAt" }
              },
              results: {
                $push: {
                  slug: "$slug",
                  title: "$title",
                  year: "$year",
                  month: "$month",
                  day: "$day"
                }
              }
            }
          });
        } else {
          pipeline.push({
            $group: {
              _id: {
                year: { $year: "$createdAt" },
                month: { $month: "$createdAt" }
              }
            }
          });
        }
        pipeline.push({ $sort: { "_id.year": 1, "_id.month": 1 } });

        return this.collection
          .aggregate(pipeline)
          .then(doc => {
            return doc;
          })
          .catch(err => logger.error("Could not process the query", err));
      }
    },

    pages: {
      permission: C.PERM_PUBLIC,
      cache: true, // if true, we don't increment the views!
      handler(ctx) {
        const pageOptions = {
          skip: parseInt(ctx.params.skip),
          limit: Math.min(
            parseInt(ctx.params.limit) || config.paging.default_limit,
            config.paging.max_limit
          )
        };
        logger.info("Filtering ", pageOptions);
        return this.collection
          .find({}, "code")
          .skip(pageOptions.skip)
          .limit(pageOptions.limit)
          .sort("-createdAt")
          .exec()
          .then(doc => {
            return this.toJSON(doc);
          });
      }
    },

    categories: {
      permission: C.PERM_PUBLIC,
      cache: true, // if true, we don't increment the views!
      handler(ctx) {
        const category = ctx.params.category;
        const self = this;
        const categoryService = this.categoryService.collection;
        return categoryService
          .findOne({ slug: category })
          .select("id category_id")
          .exec()
          .then(res => {
            logger.info("Category ", res);
            return self.collection
              .find(
                { categories: { $in: [res.category_id] } },
                "code slug title"
              )
              .exec()
              .then(doc => {
                return doc;
              });
          })
          .then(doc => {
            return self.toJSON(doc);
          })
          .then(json => {
            return this.populateModels(json);
          })
          .catch(err => logger.error("Could not process the query", err));
      }
    },

    tags: {
      permission: C.PERM_PUBLIC,
      cache: true, // if true, we don't increment the views!
      handler(ctx) {
        const tag = ctx.params.tag;
        const self = this;
        const tagService = this.tagService.collection;
        return tagService
          .findOne({ slug: tag })
          .select("id tag_id")
          .exec()
          .then(res => {
            logger.info("Tag ", res);
            return self.collection
              .find({ tags: { $in: [res.tag_id] } }, "code slug title")
              .exec()
              .then(doc => {
                return doc;
              });
          })
          .then(doc => {
            return self.toJSON(doc);
          })
          .then(json => {
            return this.populateModels(json);
          })
          .catch(err => logger.error("Could not process the query", err));
      }
    },

    pageCount: {
      permission: C.PERM_PUBLIC,
      cache: true, // if true, we don't increment the views!
      handler(ctx) {
        const limit = Math.min(
          parseInt(ctx.params.limit) || config.paging.default_limit,
          config.paging.max_limit
        );

        return this.collection
          .count()
          .exec()
          .then(doc => {
            return Math.round(doc / limit);
          });
      }
    },

    vote(ctx) {
      ctx.assertModelIsExist(ctx.t("app:HexoPostNotFound"));

      return this.collection
        .findById(ctx.modelID)
        .exec()
        .then(doc => {
          // Check user is on voters
          if (doc.voters.indexOf(ctx.user.id) !== -1)
            throw ctx.errorBadRequest(
              C.ERR_ALREADY_VOTED,
              ctx.t("app:YouHaveAlreadyVotedThisHexoPost")
            );
          return doc;
        })
        .then(doc => {
          // Add user to voters
          return HexoPost.findByIdAndUpdate(
            doc.id,
            { $addToSet: { voters: ctx.user.id }, $inc: { votes: 1 } },
            { new: true }
          );
        })
        .then(doc => {
          return this.toJSON(doc);
        })
        .then(json => {
          return this.populateModels(json);
        })
        .then(json => {
          this.notifyModelChanges(ctx, "voted", json);
          return json;
        });
    },

    unvote(ctx) {
      ctx.assertModelIsExist(ctx.t("app:HexoPostNotFound"));

      return this.collection
        .findById(ctx.modelID)
        .exec()
        .then(doc => {
          // Check user is on voters
          if (doc.voters.indexOf(ctx.user.id) == -1)
            throw ctx.errorBadRequest(
              C.ERR_NOT_VOTED_YET,
              ctx.t("app:YouHaveNotVotedThisHexoPostYet")
            );
          return doc;
        })
        .then(doc => {
          // Remove user from voters
          return HexoPost.findByIdAndUpdate(
            doc.id,
            { $pull: { voters: ctx.user.id }, $inc: { votes: -1 } },
            { new: true }
          );
        })
        .then(doc => {
          return this.toJSON(doc);
        })
        .then(json => {
          return this.populateModels(json);
        })
        .then(json => {
          this.notifyModelChanges(ctx, "unvoted", json);
          return json;
        });
    }
  },

  methods: {
    /**
		 * Validate params of context.
		 * We will call it in `create` and `update` actions
		 *
		 * @param {Context} ctx 			context of request
		 * @param {boolean} strictMode 		strictMode. If true, need to exists the required parameters
		 */
    validateParams(ctx, strictMode) {
      if (strictMode || ctx.hasParam("title"))
        ctx
          .validateParam("title")
          .trim()
          .notEmpty(ctx.t("app:HexoPostTitleCannotBeEmpty"))
          .end();

      if (strictMode || ctx.hasParam("content"))
        ctx
          .validateParam("content")
          .trim()
          .notEmpty(ctx.t("app:HexoPostContentCannotBeEmpty"))
          .end();

      if (ctx.hasValidationErrors())
        throw ctx.errorBadRequest(C.ERR_VALIDATION_ERROR, ctx.validationErrors);
    }
  },

  /**
	 * Check the owner of model
	 *
	 * @param {any} ctx	Context of request
	 * @returns	{Promise}
	 */
  ownerChecker(ctx) {
    return new Promise((resolve, reject) => {
      ctx.assertModelIsExist(ctx.t("app:HexoPostNotFound"));

      if (ctx.model.author.code == ctx.user.code || ctx.isAdmin()) resolve();
      else reject();
    });
  },

  init(ctx) {
    // Fired when start the service
    this.personService = ctx.services("persons");
    this.tagService = ctx.services("tags");
    this.categoryService = ctx.services("categories");

    // Add custom error types
    C.append(["ALREADY_VOTED", "NOT_VOTED_YET"], "ERR");
  },

  socket: {
    afterConnection(socket, io) {
      // Fired when a new client connected via websocket
    }
  },

  graphql: {
    query: `
			hexoposts(limit: Int, offset: Int, sort: String): [HexoPost]
			hexopost(code: String): HexoPost
		`,

    types: `
			type HexoPost {
				code: String!
				title: String,
				excerpt: String,
				content: String
				author: Person!
				views: Int
				votes: Int,
				voters(limit: Int, offset: Int, sort: String): [Person]
				createdAt: Timestamp
				updatedAt: Timestamp
				more: String,
				comments: Boolean
				permalink: String
				link: String
				tags: [Tag]
				categories: [Category]
				slug: String
				thumbnailImageUrl: String
				thumbnailImagePosition: String
				coverImage: String
				coverCaption: String
				autoThumbnailImage: Boolean
				content: String
				day: Int
				month: Int
				year: Int
			}
		`,

    mutation: " ",

    resolvers: {
      Query: {
        hexoposts: "find",
        hexopost: "get"
      },

      Mutation: {
        /*postCreate: "create",
        postUpdate: "update",
        postRemove: "remove",
        postVote: "vote",
        postUnvote: "unvote"*/
      }
    }
  }
};

/*
## GraphiQL test ##

# Find all posts
query getHexoPosts {
  posts(sort: "-createdAt -votes", limit: 3) {
    ...postFields
  }
}

# Create a new post
mutation createHexoPost {
  postCreate(title: "New post", content: "New post content") {
    ...postFields
  }
}

# Get a post
query getHexoPost($code: String!) {
  post(code: $code) {
    ...postFields
  }
}

# Update an existing post
mutation updateHexoPost($code: String!) {
  postUpdate(code: $code, content: "Modified post content") {
    ...postFields
  }
}

# vote the post
mutation voteHexoPost($code: String!) {
  postVote(code: $code) {
    ...postFields
  }
}

# unvote the post
mutation unVoteHexoPost($code: String!) {
  postUnvote(code: $code) {
    ...postFields
  }
}

# Remove a post
mutation removeHexoPost($code: String!) {
  postRemove(code: $code) {
    ...postFields
  }
}



fragment postFields on HexoPost {
    code
    title
    content
    author {
      code
      fullName
      username
      avatar
    }
    views
    votes
  	voters {
  	  code
  	  fullName
  	  username
  	  avatar
  	}
}

*/
