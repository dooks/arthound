/* Normalizing filter functions for each source */

// Base:
// author: "grachiel"
// author_link: "grachiel.deviantart.com"
// content: "http://orig05.deviantart.net/0fe6/f/2012/132/c/0/anime_by_grachiel-d4zjpg1.jpg"
// date: 1336801385
// favorites: 0
// height: 600
// id: "F3EA54E5-C93F-5F62-C3B9-2CD9F200B984"
// preview: 
// source: "deviantart"
// thumbs: ""
// title: "Anime"
// url: "http://grachiel.deviantart.com/art/Anime-301570705"
// width: 750

module.exports.template = {
  author:      "",
  author_link: "",
  content:     "",
  date:         0,
  favorites:    0,
  height:       0,
  id:          "",
  preview:     "",
  source:      "",
  thumbs:      "",
  title:       "",
  url:         "",
  source:      "",
  width:        0
}

module.exports.deviantart = function(body) {
  var new_body = body;

  for(var i = 0; i < new_body.length; i++) {

    // Normalize
    new_body[i].author      = new_body[i].author  || {};
    new_body[i].content     = new_body[i].content || {};
    new_body[i].preview     = new_body[i].preview || {};

    // Flatten
    new_body[i].author      = new_body[i].author.username || "";
    new_body[i].width       = new_body[i].content.width   ||  1;
    new_body[i].height      = new_body[i].content.height  ||  1;
    new_body[i].content     = new_body[i].content.src     || "";
    new_body[i].favorites   = new_body[i].stats.favorites ||  0;
    new_body[i].preview     = new_body[i].preview.src     || null;
    new_body[i].deviationid = new_body[i].deviationid     || "";
    new_body[i].title       = new_body[i].title           || "";
    new_body[i].url         = new_body[i].url             || "#";
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
    new_body[i].width       = new_body[i].width       ||   1;
    new_body[i].height      = new_body[i].height      ||   1;
    new_body[i].favorites   = new_body[i].fav_count   ||  "";
    new_body[i].preview     = new_body[i].sample_url  ||  "";
    new_body[i].title       = new_body[i].id          ||   0;
    new_body[i].url         = new_body[i].source      ||  "#";
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

module.exports.imgur = function(body) {
  var new_body = body;

  for(var i = 0; i < new_body.length; i++) {
    // thumbnail suffixes:    s, b, t, m, l, h
    // https://api.imgur.com/models/gallery_image

    var s = "Courses/Assess/Responsive_Cousre_1_1.png";
    var link = new_body[i].link;

    // Normalize
    new_body[i].author      = new_body[i].account_url || "";
    if(new_body[i].author !== "") {
      new_body[i].author_link = "https://imgur.com/user/" +
                                new_body[i].account_url;
    } else { new_body[i].author_link = "" }
    new_body[i].content     = new_body[i].link        || "";
    new_body[i].date        = new_body[i].datetime    ||  0;
    new_body[i].favorites   = new_body[i].ups         ||  0;
    new_body[i].width       = new_body[i].width       ||  1;
    new_body[i].height      = new_body[i].height      ||  1; // Prevent divide by zero
    new_body[i].id          = new_body[i].id          ||  0;
    new_body[i].title       = new_body[i].title       || "";
    new_body[i].url         = new_body[i].link        || "#";
    new_body[i].thumbs      = new_body[i].link        || "";
    //new_body[i].preview     = link.substring(0, link.lastIndexOf(".")) +
                              //"h" + link.substring(link.lastIndexOf("."))
                              //|| ""; // Imgur Huge Thumbnail
    //new_body[i].thumbs      = link.substring(0, link.lastIndexOf(".")) +
                              //"b" + link.substring(link.lastIndexOf("."))
                              //|| ""; // Imgur Big Square thumbnail

    // Strip
    delete new_body[i].description;
    delete new_body[i].datetime;
    delete new_body[i].type;
    delete new_body[i].animated;
    delete new_body[i].size;
    delete new_body[i].views;
    delete new_body[i].bandwidth;
    delete new_body[i].vote;
    delete new_body[i].favorite;
    delete new_body[i].nsfw;
    delete new_body[i].section;
    delete new_body[i].account_url;
    delete new_body[i].account_id;
    delete new_body[i].comment_preview;
    delete new_body[i].topic;
    delete new_body[i].topic_id;
    delete new_body[i].link;
    delete new_body[i].comment_count;
    delete new_body[i].ups;
    delete new_body[i].downs;
    delete new_body[i].points;
    delete new_body[i].is_album;
    delete new_body[i].gifv;
    delete new_body[i].webm;
    delete new_body[i].mp4;
    delete new_body[i].looping;
  }

  return new_body;
}
