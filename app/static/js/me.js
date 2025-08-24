
document.getElementById('logoutBtn').addEventListener('click', function(e) {
    if (!confirm('Are you sure you want to sign out?')) {
        e.preventDefault();
    }
});
