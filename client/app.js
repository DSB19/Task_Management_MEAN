const app = angular.module('TaskApp', []);

// Authentication Controller
app.controller('AuthController', function($scope, $http) {
    // Registration function
    $scope.register = function() {
        $http.post('/register', {
            name: $scope.registerName,
            email: $scope.registerEmail,
            password: $scope.registerPassword,
            number: $scope.registerNumber
        }).then(function(response) {
            alert(response.data.message || 'Registration successful');
        }).catch(function(error) {
            alert(error.data.error || 'Registration failed');
        });
    };

    // Login function
    $scope.login = function() {
        $http.post('/login', {
            email: $scope.loginEmail,
            password: $scope.loginPassword
        }).then(function(response) {
            alert(response.data.message || 'Login successful');
            localStorage.setItem('token', response.data.token);  // Store token in local storage
            window.location.href = 'tasks.html';  // Redirect to task management page
        }).catch(function(error) {
            alert(error.data.error || 'Login failed');
        });
    };
});

// Task Management Controller
app.controller('TaskController', function($scope, $http) {
    $scope.tasks = [];
    $scope.taskDetails = null;  // Store task details for the selected task
    $scope.task = {};  // Model for task (add/edit)

    // Function to load all tasks
    $scope.loadTasks = function() {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('You must be logged in to view tasks');
            window.location.href = 'login.html';  // Redirect to login if no token
            return;
        }

        // Get tasks of the logged-in user
        $http.get('/tasks', { headers: { Authorization: token } })
            .then(function(response) {
                $scope.tasks = response.data;
            }).catch(function(error) {
                if (error.status === 401) {
                    alert('Session expired. Please log in again.');
                    localStorage.removeItem('token');
                    window.location.href = 'login.html';  // Redirect to login page if token is invalid/expired
                } else {
                    alert(error.data.error || 'Failed to load tasks');
                }
            });
    };

    // Function to show details of a clicked task
    $scope.showTaskDetails = function(task) {
        $scope.taskDetails = task;  // Set the selected task's details
    };

    // Function to add a new task
    $scope.addTask = function() {
        $scope.taskDetails = { title: '', description: '' };  // Initialize blank task for adding
    };

    // Function to save a task (add or update)
    $scope.saveTask = function() {
        const token = localStorage.getItem('token');
        if ($scope.taskDetails._id) {
            // Update existing task
            $http.put(`/tasks/${$scope.taskDetails._id}`, $scope.taskDetails, { headers: { Authorization: token } })
                .then(function(response) {
                    $scope.loadTasks();  // Refresh task list
                    $scope.taskDetails = null;  // Clear task details
                }).catch(function(error) {
                    alert(error.data.error || 'Failed to update task');
                });
        } else {
            // Add new task
            $http.post('/tasks', $scope.taskDetails, { headers: { Authorization: token } })
                .then(function(response) {
                    $scope.tasks.push(response.data);  // Add new task to list
                    $scope.taskDetails = null;  // Clear task details
                }).catch(function(error) {
                    alert(error.data.error || 'Failed to add task');
                });
        }
    };

    // Function to delete a task
    $scope.deleteTask = function(taskId) {
        const token = localStorage.getItem('token');
        $http.delete(`/tasks/${taskId}`, { headers: { Authorization: token } })
            .then(function(response) {
                $scope.loadTasks();  // Refresh task list
                $scope.taskDetails = null;  // Clear task details
            }).catch(function(error) {
                alert(error.data.error || 'Failed to delete task');
            });
    };

    // Log out the user and redirect to login page
    $scope.logout = function() {
        localStorage.removeItem('token');
        window.location.href = 'login.html';  // Redirect to login page
    };

    // Load tasks when page loads
    $scope.loadTasks();  // This ensures tasks are loaded immediately when the controller is initialized
});
