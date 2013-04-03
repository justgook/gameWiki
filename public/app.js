$.fn.serializeObject = function ()
{
    var o = {};
    var a = this.serializeArray();
    $.each(a, function() {
        if (o[this.name] || o[this.name] == '') {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};
(function ($) {
  // **ListView class**: Our main app view.
  var Wiki = Backbone.Model.extend({
    // urlRoot:"/data/wiki",
    defaults:{
      id: null,
      title: null,
      body: null
    },
  });
  //wiki collection
  var WikiList = Backbone.Collection.extend({
    model: Wiki,
    url: '/data/wiki'
  });


  // collection: WikiList,
  var WikiListView = Backbone.View.extend({
    template: "#WikiListView",
    collection: WikiList,
    initialize: function () {
      var that = this;
      this.template = Mustache.compile($(this.template)[0].innerHTML);
      this.listenTo(this.collection, "add", this.render);
      _.bindAll(this, 'render');
    },
    render: function () {
      var cTemplate = this.template({
        posts:this.collection.toJSON(),
        linkToTitle: function () {
          return "/wiki/" + this.id;
        }
      });
      $(this.el).html(cTemplate);
    }
  });
  //TODO add BaseApplicationView to extend it
//View one wiki post
  var WikiItemView = Backbone.View.extend({
    // el:document.createDocumentFragment,
    template: "#WikiItemView",
    model:Wiki,
    initialize: function () {
      this.template = Mustache.compile($(this.template)[0].innerHTML);
      _.bindAll(this, 'render');
    },
    render: function () {
      $(this.el).html(this.template(this.model.toJSON()));
    },
    changeModel: function (model) {
      this.model = model;
    }
  });
  //Modal box for create and update wiki posts
  var ModalBox = Backbone.View.extend({
    template:"#WikiCreate",
    el: "#modal",
    events:{
      "submit form": "createWikiPost"
    },
    initialize:function (app) {
      this.app = app.app;
      this.template = Mustache.compile($(this.template)[0].innerHTML);
      _.bindAll(this, 'render');
    },
    render: function() {
      $(this.el).html(this.template({editMode:"create"}));
    },
    createWikiPost: function (e) {
      var data = $(e.target).serializeObject();
      var wikiModel = new Wiki(data);
      this.app.collection.add(wikiModel);
      wikiModel.save();
      return false;
    }
  });

  //Router 
  var Router = Backbone.Router.extend({
    routes: {
      "":                    "wikiList",
      "wiki/:item":           "wikiItem",
      "create/wiki":          "wikiCreate"
    },
    app: null,
    initialize: function (app) {
      this.app = app.app;
      this.modal = new ModalBox({app:this.app});
      this.app.collection = new WikiList;
    },
    wikiList: function wikiLiatRouter () {
      if (!this.app.views.listView) {
        this.app.views.listView = new WikiListView({collection:this.app.collection, el:this.app.containers.main});
        this.app.collection.fetch({
          success: this.app.views.listView.render
        });
      } else {
      this.app.views.listView.render();
      }
    },
    wikiItem: function wikiLiatRouter (id) {
      var that = this;
      var model = new Wiki({id:id});
      this.app.collection.add(model);
      if (!that.app.views.itemView) {
        that.app.views.itemView = new WikiItemView({model:model, el:that.app.containers.main});
      } else {
        that.app.views.itemView.changeModel(model);
      }
      model.fetch({
        success:that.app.views.itemView.render
      });
    },
    wikiCreate: function wikiCreatRouter () {
      this.modal.render();
    },
    help: function() {},
    search: function(query, page) {}
  });

  var AppView = Backbone.View.extend({
    events: {},
    views: {},
    initialize: function () {
      this.containers = {main: $("#content")};
      new Router({app:this});
      Backbone.history.start({ pushState: true});
      $(document).on("click", "a[href]:not([data-bypass])", function (evt) {
        var href = { prop: $(this).prop("href"), attr: $(this).attr("href") };
        root = location.protocol + "//" + location.host + "/";
        if(href.prop.slice(0, root.length) === root) {
          evt.preventDefault();
          Backbone.history.navigate(href.attr, true);
          return false;
        }
      });
    }
  });
  $(function(){
    new AppView();
  });

})(jQuery);


