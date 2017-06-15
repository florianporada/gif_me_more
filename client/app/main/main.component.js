import angular from 'angular';
import uiRouter from 'angular-ui-router';
import routing from './main.routes';

export class MainController {
  giphyApiKey = 'dc6zaTOxFJmzC';
  activeTrend = '';
  awesomeThings = [];
  gifs = [];
  savedGifs = [];
  locations = [];
  trends = [];
  search = '';
  newThing = '';
  uuid = '';
  loadingLocation = false;
  loadingTrends = false;
  loadingGifs = false;
  nothingFound = false;

  /*@ngInject*/
  constructor($http, $scope, $window, socket, localStorageService) {
    this.$http = $http;
    this.$window = $window;
    this.socket = socket;
    this.localStorageService = localStorageService;

    $scope.$on('$destroy', function() {
      socket.unsyncUpdates('thing');
    });

    $scope.$on('$destroy', function() {
      socket.unsyncUpdates('gif');
    });
  }

  $onInit() {
    if(this.getItemFromLocalStorage('uuid') === null) {
      this.$http.get('/api/gifs/uuid/1')
        .then(res => {
          console.log(res);
          this.submitToLocalStorage('uuid', res.data);
        });
    }

    this.uuid = this.getItemFromLocalStorage('uuid');
    this.$http.get(`/api/gifs/${this.uuid}`)
      .then(response => {
        this.loaded = true;
        this.savedGifs = response.data;
        this.socket.syncUpdates('gif', this.savedGifs);
      });

    this.$http.get('/api/things')
      .then(response => {
        this.awesomeThings = response.data;
        this.socket.syncUpdates('thing', this.awesomeThings);
      });

    this.getPlacesByLocation();
  }

  submitToLocalStorage(key, val) {
    return this.localStorageService.set(key, val);
  }

  getItemFromLocalStorage(key) {
    return this.localStorageService.get(key);
  }

  getGifs(trend) {
    if(this.search === '') {
      this.search = trend;
    }
    let searchTerms = this.search.split(',').map(function(item) {
      return item
        .replace(/\s/g, '+')
        .replace('#', '')
        .trim();
    });

    this.activeTrend = searchTerms.toString();
    this.gifs = [];
    this.loadingGifs = true;
    this.$http.get(`/api/gifs/get_gifs/${JSON.stringify(searchTerms)}`)
      .then(response => {
        this.search = '';
        this.loadingGifs = false;

        if(response.data.length === 0) {
          this.nothingFound = true;

          return;
        }

        this.nothingFound = false;
        this.gifs = response.data;
        console.log(response);
      });
  }

  getPlacesByLocation() {
    this.loadingLocation = true;
    this.locations = [];
    this.trends = [];

    // Get the location.
    navigator.geolocation.getCurrentPosition(position => {
      // Get the positioning coordinates.
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      this.$http.get(`/api/twitter/places/${lat}/${lng}`)
        .then(response => {
          this.loadingLocation = false;
          this.locations = response.data;
          console.log(response);
        });
    });
  }

  getTrendsByPlace(woeid) {
    this.loadingTrends = true;
    this.$http.get(`/api/twitter/trends/${woeid}`)
      .then(response => {
        console.log(response);
        this.loadingTrends = false;
        this.trends = response.data[0].trends;
      });
  }

  getGifByTrend(trend) {
    this.getGifs(trend);
  }

  saveGif(gif) {
    const saveGif = {
      name: gif.slug,
      uuid: this.uuid,
      associatedTrend: this.activeTrend,
      gif
    };

    this.$http.post('/api/gifs', saveGif).then(res => {
      this.savedGifs.push(res.data);
    }, err => {
      if(err) {
        console.log(err);
      }
    });
  }

  deleteGif(gif, index) {
    this.$http.delete(`/api/gifs/${gif._id}`).then(res => {
      this.savedGifs.splice(index, 1);
    }, err => {
      if(err) {
        console.log(err);
      }
    });
  }

  shareGif(gif) {
    console.log(gif);
    const url = `http://twitter.com/share?text=Oi&url=${gif.gif.bitly_url}&hashtags=${gif.associatedTrend.replace(/\s/g, '')}`;
    this.$window.open(url, '_blank');
  }

  getRandomBackground() {
    if(!this.savedGifs.length === 0) {
      const item = this.savedGifs[Math.floor(Math.random() * this.savedGifs.length)];

      return `url('${item.gif.images.original.url}')`;
    }
  }

  addThing() {
    if(this.newThing) {
      this.$http.post('/api/things', {
        name: this.newThing
      });
      this.newThing = '';
    }
  }

  deleteThing(thing) {
    this.$http.delete(`/api/things/${thing._id}`);
  }
}

export default angular.module('gifMeMoreApp.main', [uiRouter])
  .config(routing)
  .component('main', {
    template: require('./main.html'),
    controller: MainController
  })
  .name;
