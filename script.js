var app = angular.module('countrypediaApp', ['ngRoute']);

app.config(['$routeProvider', function($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'home.html',
            controller: 'CountryController'
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
            $scope.countries = response.data;
            $scope.totalPages = Math.ceil($scope.countries.length / $scope.countriesPerPage);
            $scope.currentPage = 1;
            updateCountriesList();
            updatePagination();
        }).catch(function(error) {
            alert('Country "' + $scope.searchQuery + '" not found. Please try again.');
        });
    };    
}]);