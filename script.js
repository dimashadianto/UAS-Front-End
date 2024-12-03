var app = angular.module('countrypediaApp', ['ngRoute']);

// Configurations
app.config(['$routeProvider', function($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'view/home.html',
            controller: 'CountryController'
        })
        .when('/details/:countryName', {
            templateUrl: 'view/details.html',
            controller: 'CountryDetailsController'
        })
        .when('/currency', {
            templateUrl: 'view/currency.html',
            controller: 'CurrencyController'
        })
        .otherwise({
            redirectTo: '/'
        });
}]);

// Shared Service for Region
app.service('RegionService', function() {
    this.selectedRegion = ''; // Shared region state
});

// MainController for Dropdown
app.controller('MainController', ['$scope', 'RegionService', function($scope, RegionService) {
    $scope.selectedRegion = RegionService.selectedRegion;

    $scope.filterByRegion = function(region) {
        console.log('Region selected:', region); // Debugging
        RegionService.selectedRegion = region; // Update shared region state
    };
}]);

// CountryController
app.controller('CountryController', ['$scope', '$http', '$location', 'RegionService', function($scope, $http, $location, RegionService) {
    $scope.currentPage = 1;
    $scope.countriesPerPage = 18;
    $scope.countries = [];
    $scope.countriesToShow = [];
    $scope.totalPages = 0;
    $scope.searchQuery = '';
    $scope.searchType = 'name';
    $scope.alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    $scope.selectedRegion = RegionService.selectedRegion;

    function loadCountries() {
        const region = RegionService.selectedRegion;
        $scope.countries = [];
        if (!region) {
            $http.get('https://restcountries.com/v3.1/all').then(function(response) {
                $scope.countries = response.data;
                updatePagination();
                updateCountriesList();
            });
        } else {
            $http.get(`https://restcountries.com/v3.1/region/${region}`).then(function(response) {
                $scope.countries = response.data;
                updatePagination();
                updateCountriesList();
            });
        }
    }

    function updatePagination() {
        $scope.totalPages = Math.ceil($scope.countries.length / $scope.countriesPerPage);
    }

    function updateCountriesList() {
        const startIndex = ($scope.currentPage - 1) * $scope.countriesPerPage;
        $scope.countriesToShow = $scope.countries.slice(startIndex, startIndex + $scope.countriesPerPage);
    }

    $scope.nextPage = function() {
        if ($scope.currentPage < $scope.totalPages) {
            $scope.currentPage++;
            updateCountriesList();
        }
    };

    $scope.prevPage = function() {
        if ($scope.currentPage > 1) {
            $scope.currentPage--;
            updateCountriesList();
        }
    };

    $scope.filterByLetter = function(letter) {
        $http.get('https://restcountries.com/v3.1/all').then(function(response) {
            $scope.countries = response.data.filter(function(country) {
                return country.name.common.charAt(0).toUpperCase() === letter;
            });

            if ($scope.countries.length === 0) {
                $scope.errorMessage = `No countries found starting with the letter "${letter}".`;
            } else {
                $scope.errorMessage = '';
            }

            updatePagination();
            $scope.currentPage = 1;
            updateCountriesList();
        });
    };

    $scope.searchCountry = function() {
        let url;
        if ($scope.searchQuery) {
            if ($scope.searchType === 'name') {
                url = `https://restcountries.com/v3.1/name/${$scope.searchQuery}`;
            } else if ($scope.searchType === 'code') {
                url = `https://restcountries.com/v3.1/alpha/${$scope.searchQuery}`;
            }
        } else {
            url = 'https://restcountries.com/v3.1/all';
        }

        $http.get(url).then(function(response) {
            if ($scope.searchQuery && $scope.searchType === 'name') {
                $scope.countries = response.data.filter(function(country) {
                    return country.name.common.toLowerCase().includes($scope.searchQuery.toLowerCase());
                });
            } else {
                $scope.countries = response.data;
            }

            updatePagination();
            $scope.currentPage = 1;
            updateCountriesList();
        }).catch(function(error) {
            alert('Country "' + $scope.searchQuery + '" not found. Please try again.');
        });
    };

    $scope.$watch(function() {
        return RegionService.selectedRegion;
    }, function(newRegion, oldRegion) {
        if (newRegion !== oldRegion) {
            $scope.currentPage = 1; // Reset to first page
            loadCountries();
        }
    });

    loadCountries();
}]);

// CountryDetailsController
app.controller('CountryDetailsController', ['$scope', '$routeParams', '$http', '$location', function($scope, $routeParams, $http, $location) {
    const countryName = $routeParams.countryName;

    $http.get(`https://restcountries.com/v3.1/name/${countryName}?fullText=true`)
        .then(function(response) {
            if (response.data && response.data.length > 0) {
                $scope.country = response.data[0];
            } else {
                alert('Country details not found.');
                $location.path('/');
            }
        })
        .catch(function(error) {
            alert('Error fetching country details.');
            $location.path('/');
        });

    $scope.goBack = function() {
        $location.path('/');
    };
}]);

// CurrencyController
app.controller('CurrencyController', ['$scope', '$http', 'RegionService', function($scope, $http, RegionService) {
    $scope.currentPage = 1;
    $scope.countriesPerPage = 10;
    $scope.countries = [];
    $scope.countriesToShow = [];
    $scope.totalPages = 0;

    $scope.selectedRegion = RegionService.selectedRegion;

    function loadCountries() {
        const region = RegionService.selectedRegion;
        $scope.countries = [];
        if (!region) {
            $http.get('https://restcountries.com/v3.1/all').then(function(response) {
                $scope.countries = processCurrencyData(response.data);
                updatePagination();
                updateCountriesList();
            });
        } else {
            $http.get(`https://restcountries.com/v3.1/region/${region}`).then(function(response) {
                $scope.countries = processCurrencyData(response.data);
                updatePagination();
                updateCountriesList();
            });
        }
    }

    function processCurrencyData(data) {
        return data.map(country => {
            const currencyKey = country.currencies ? Object.keys(country.currencies)[0] : null;
            const currency = currencyKey ? country.currencies[currencyKey] : { name: 'N/A', symbol: 'N/A' };

            return {
                name: country.name?.common || 'Unknown',
                flag: country.flags?.png || 'https://via.placeholder.com/50',
                currencyName: currency.name || 'N/A',
                currencySymbol: currency.symbol || 'N/A',
                telCode: country.idd?.root && country.idd.suffixes?.length
                    ? `${country.idd.root}${country.idd.suffixes[0]}`
                    : 'N/A',
            };
        });
    }

    function updatePagination() {
        $scope.totalPages = Math.ceil($scope.countries.length / $scope.countriesPerPage);
    }

    function updateCountriesList() {
        const startIndex = ($scope.currentPage - 1) * $scope.countriesPerPage;
        $scope.countriesToShow = $scope.countries.slice(startIndex, startIndex + $scope.countriesPerPage);
    }

    $scope.nextPage = function() {
        if ($scope.currentPage < $scope.totalPages) {
            $scope.currentPage++;
            updateCountriesList();
        }
    };

    $scope.prevPage = function() {
        if ($scope.currentPage > 1) {
            $scope.currentPage--;
            updateCountriesList();
        }
    };

    $scope.$watch(function() {
        return RegionService.selectedRegion;
    }, function(newRegion, oldRegion) {
        if (newRegion !== oldRegion) {
            $scope.currentPage = 1; // Reset to first page
            loadCountries();
        }
    });

    loadCountries();
}]);
