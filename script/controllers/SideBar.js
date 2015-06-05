﻿import 'angular';

export default [
    '$rootScope',
    '$location',
    '$scope',
    'searchData',
    class {

        constructor($rootScope, $location, $scope, searchData) {
            this.$rootScope = $rootScope;
            this.$location = $location;
            this.$scope = $scope;

            this.handleScope(searchData);
            this.initialize();
        }

        //#region Properties

        get _() {
            return this.__ || (this.__ = Object.create(null, {}));
        }

        //#endregion

        //#region Methods

        handleScope(searchData) {
            this.$rootScope.gridState = 'list-view';

            this.$scope.searchService = searchData;
        }

        initialize() {
            if (this.$scope.searchService.config.loadJobsOnStart) {
                this.$scope.searchService.makeSearchApiCall();
            }

            this.$scope.searchService.getCountByLocation(this.setLocations());
            this.$scope.searchService.getCountByCategory(this.setCategories());

            this.$scope.$watchCollection('searchService.searchParams.category', this.updateFilterCountsAnonymous());
            this.$scope.$watchCollection('searchService.searchParams.location', this.updateFilterCountsAnonymous());
        }

        setLocations() {
            var controller = this;

            return function(locations) {
                controller.$scope.locations = locations;
            };
        }

        setCategories() {
            var controller = this;

            return function(categories) {
                controller.$scope.categories = categories;
            };
        }

        updateCountsByIntersection(oldCounts, newCounts, getProperty) {
            angular.forEach(oldCounts, function (oldCount) {
                var found = false;

                angular.forEach(newCounts, function (newCount) {

                    if (getProperty.call(oldCount) == getProperty.call(newCount)) {
                        oldCount.idCount = newCount.idCount;
                        found = true;
                    }
                });

                if (!found) {
                    oldCount.idCount = 0;
                }
            });
        }

        updateFilterCounts() {
            var controller = this;

            if(this.$scope.locations) {
                this.$scope.searchService.getCountByLocation(function (locations) {
                    controller.updateCountsByIntersection(controller.$scope.locations, locations, function() {
                        return this.address.state;
                    });

                    controller.$scope.locations = controller.$scope.locations;
                });
            }

            if(this.$scope.categories) {
                this.$scope.searchService.getCountByCategory(function (categories) {
                    controller.updateCountsByIntersection(controller.$scope.categories, categories, function() {
                        return this.publishedCategory.id;
                    });

                    controller.$scope.categories = controller.$scope.categories;
                });
            }
        }

        updateFilterCountsAnonymous() {
            var controller = this;

            return function() {
                controller.updateFilterCounts();
            };
        }

        searchJobs() {
            this.$scope.searchService.makeSearchApiCall();

            this.updateFilterCounts();
        }

        clearSearchParamsAndLoadData() {
            this.$scope.searchService.helper.clearSearchParams();
            this.$scope.searchService.makeSearchApiCall();

            this.updateFilterCounts();
        }

        switchViewStyle(type) {
            this.$rootScope.gridState = type + '-view';
        }

        goBack(state) {
            if (this.$rootScope.viewState === state) {
                this.$location.path('/jobs');
            }
        }

        //#endregion
    }
];