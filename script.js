var app = angular.module('countrypediaApp', ['ngRoute']);

app.config(['$routeProvider', function($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'view/home.html',
            controller: 'CountryController'
        })
        .when('/currency', {
            templateUrl: 'view/currency.html',
            controller: 'CurrencyController'
        })
        .otherwise({
            redirectTo: '/'
        });
}]);

app.controller('CountryController', ['$scope', '$http', function($scope, $http) {
    $scope.currentPage = 1;
    $scope.countriesPerPage = 18;
    $scope.searchQuery = '';
    $scope.searchType = 'name';
    $scope.alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

    $http.get('https://restcountries.com/v3.1/all').then(function(response) {
        $scope.countries = response.data;
        $scope.totalPages = Math.ceil($scope.countries.length / $scope.countriesPerPage);
        updateCountriesList();
        updatePagination();
    });

    function updateCountriesList() {
        const startIndex = ($scope.currentPage - 1) * $scope.countriesPerPage;
        $scope.countriesToShow = $scope.countries.slice(startIndex, startIndex + $scope.countriesPerPage);
    };

    function updatePagination() {
        const total = $scope.totalPages;
        const current = $scope.currentPage;
        $scope.pagesToShow = [];

        if (total <= 10) {
            $scope.pagesToShow = Array.from({ length: total }, (_, i) => i + 1);
        } else {
            if (current <= 3) {
                $scope.pagesToShow = [1, 2, 3, '...', total - 2, total - 1, total];
            } else if (current >= total - 2) {
                $scope.pagesToShow = [1, 2, 3, '...', total - 2, total - 1, total];
            } else {
                $scope.pagesToShow = [1, '...', current - 1, current, current + 1, '...', total];
            }
        }
    };

    $scope.goToPage = function(page) {
        if (page >= 1 && page <= $scope.totalPages) {
            $scope.currentPage = page;
            updateCountriesList();
            updatePagination();
        }
    };

    $scope.prevPage = function() {
        if ($scope.currentPage > 1) {
            $scope.currentPage--;
            updateCountriesList();
            updatePagination();
        }
    };

    $scope.nextPage = function() {
        if ($scope.currentPage < $scope.totalPages) {
            $scope.currentPage++;
            updateCountriesList();
            updatePagination();
        }
    };
}]);

app.controller('CurrencyController', ['$scope', '$http', function ($scope, $http) {
    $scope.currentPage = 1;
    $scope.countriesPerPage = 10;
    $scope.countries = [];
    $scope.countriesToShow = [];
    $scope.pagesToShow = [];
    $scope.totalPages = 0;

    $scope.loading = true;
    $scope.error = null;

    $http.get('https://restcountries.com/v3.1/all')
        .then(function (response) {
            $scope.countries = response.data.map(country => {
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
            $scope.totalPages = Math.ceil($scope.countries.length / $scope.countriesPerPage);
            $scope.updateCountriesList();
            $scope.updatePagination();
            $scope.loading = false;
        })
        .catch(function (error) {
            $scope.error = "Could not load currency data.";
            $scope.loading = false;
            console.error(error);
        });

    $scope.updateCountriesList = function () {
        const startIndex = ($scope.currentPage - 1) * $scope.countriesPerPage;
        $scope.countriesToShow = $scope.countries.slice(startIndex, startIndex + $scope.countriesPerPage);
    };

    $scope.updatePagination = function () {
        const total = $scope.totalPages;
        const current = $scope.currentPage;
        $scope.pagesToShow = [];

        if (total <= 10) {
            $scope.pagesToShow = Array.from({ length: total }, (_, i) => i + 1);
        } else {
            if (current <= 3) {
                $scope.pagesToShow = [1, 2, 3, '...', total];
            } else if (current >= total - 2) {
                $scope.pagesToShow = [1, '...', total - 2, total - 1, total];
            } else {
                $scope.pagesToShow = [1, '...', current - 1, current, current + 1, '...', total];
            }
        }
    };

    $scope.goToPage = function (page) {
        if (page >= 1 && page <= $scope.totalPages) {
            $scope.currentPage = page;
            $scope.updateCountriesList();
            $scope.updatePagination();
        }
    };

    $scope.prevPage = function () {
        if ($scope.currentPage > 1) {
            $scope.currentPage--;
            $scope.updateCountriesList();
            $scope.updatePagination();
        }
    };

    $scope.nextPage = function () {
        if ($scope.currentPage < $scope.totalPages) {
            $scope.currentPage++;
            $scope.updateCountriesList();
            $scope.updatePagination();
        }
    };
}]);