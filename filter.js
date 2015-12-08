/* Normalizing filter functions for each source */

module.exports.deviantart = function(body) {
  var new_body = body;

  for(var i = 0; i < new_body.length; i++) {

    // Normalize
    new_body[i].author      = new_body[i].author  || {};
    new_body[i].content     = new_body[i].content || {};
    new_body[i].preview     = new_body[i].preview || {};

    // Flatten
    new_body[i].author      = new_body[i].author.username || "";
    new_body[i].width       = new_body[i].content.width   ||  0;
    new_body[i].height      = new_body[i].content.height  ||  0;
    new_body[i].content     = new_body[i].content.src     || "";
    new_body[i].favorites   = new_body[i].stats.favorites ||  0;
    new_body[i].preview     = new_body[i].preview.src     || null;
    new_body[i].deviationid = new_body[i].deviationid     || "";
    new_body[i].title       = new_body[i].title           || "";
    new_body[i].url         = new_body[i].url             || "";
    new_body[i].id          = new_body[i].deviationid     || "";
    new_body[i].date        = new_body[i].published_time  ||  0;
    new_body[i].source      = "deviantart";

    if(new_body[i].author !== "") {
      new_body[i].author_link = new_body[i].author + ".deviantart.com";
    }

    if(new_body[i].thumbs[2] !== undefined) {
      new_body[i].thumbs = new_body[i].thumbs[2].src || "";
    } else { new_body[i].thumbs = ""; }

    // Strip
    delete new_body[i].stats;
    delete new_body[i].published_time;
    delete new_body[i].$$hashKey;
    delete new_body[i].allows_comments;
    delete new_body[i].category;
    delete new_body[i].category_path;
    delete new_body[i].deviationid;
    delete new_body[i].download_filesize;
    delete new_body[i].is_deleted;
    delete new_body[i].is_downloadable;
    delete new_body[i].is_favourited;
    delete new_body[i].is_mature;
    delete new_body[i].printid;
  }

  return new_body;
};

module.exports.e926 = function(body) {
  var new_body = body;

  for(var i = 0; i < new_body.length; i++) {
    // Normalize
    new_body[i].author      = new_body[i].artist     ||   [];
    new_body[i].date        = new_body[i].created_at ||   { "s": 0};

    // Flatten
    new_body[i].author      = new_body[i].author[0]   ||  "";
    new_body[i].author_link = ""; // e621 is really bad at this
    new_body[i].content     = new_body[i].file_url    ||  "";
    new_body[i].width       = new_body[i].width       ||   0;
    new_body[i].height      = new_body[i].height      ||   0;
    new_body[i].favorites   = new_body[i].fav_count   ||  "";
    new_body[i].preview     = new_body[i].sample_url  ||  "";
    new_body[i].title       = new_body[i].id          ||   0;
    new_body[i].url         = new_body[i].source      ||  "";
    new_body[i].date        = new_body[i].date.s      ||  null;
    new_body[i].rating      = new_body[i].rating      || "e"; // Default to explicit
    new_body[i].thumbs      = new_body[i].preview_url ||  "";
    new_body[i].source      = "e926";

    // Strip
    delete new_body[i].sources;
    delete new_body[i].preview_url;
    delete new_body[i].artist;
    delete new_body[i].created_at;
    delete new_body[i].fav_count;
    delete new_body[i].sample_url;
    delete new_body[i].sample_height;
    delete new_body[i].change;
    delete new_body[i].status;
    delete new_body[i].children;
    delete new_body[i].has_children;
    delete new_body[i].has_notes;
    delete new_body[i].parent_id;
    delete new_body[i].creator_id;
    delete new_body[i].description;
    delete new_body[i].tags;
    delete new_body[i].preview_width;
    delete new_body[i].file_size;
    delete new_body[i].md5;
    delete new_body[i].file_ext;
    delete new_body[i].score;
    delete new_body[i].preview_height;
    delete new_body[i].file_url;
    delete new_body[i].sample_width;
    delete new_body[i].has_comments;
  }

  return new_body;
};
