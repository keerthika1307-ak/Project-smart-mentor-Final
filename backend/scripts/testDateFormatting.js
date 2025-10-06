// Test the new date formatting function
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now - date; // Remove Math.abs to get proper direction
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    // Handle future dates (shouldn't happen, but just in case)
    if (diffTime < 0) return 'Just now';
    
    // Less than 1 minute
    if (diffMinutes < 1) return 'Just now';
    
    // Less than 1 hour
    if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
    
    // Less than 24 hours
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    
    // 1 day
    if (diffDays === 1) return 'Yesterday';
    
    // Less than 7 days
    if (diffDays < 7) return `${diffDays} days ago`;
    
    // More than 7 days, show actual date
    return date.toLocaleDateString();
}

console.log('🧪 TESTING DATE FORMATTING FUNCTION');
console.log('====================================');

const now = new Date();

// Test cases
const testCases = [
    { desc: 'Just now', date: new Date(now.getTime() - 30 * 1000) }, // 30 seconds ago
    { desc: '5 minutes ago', date: new Date(now.getTime() - 5 * 60 * 1000) }, // 5 minutes ago
    { desc: '1 hour ago', date: new Date(now.getTime() - 1 * 60 * 60 * 1000) }, // 1 hour ago
    { desc: '3 hours ago', date: new Date(now.getTime() - 3 * 60 * 60 * 1000) }, // 3 hours ago
    { desc: 'Yesterday', date: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000) }, // 1 day ago
    { desc: '3 days ago', date: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000) }, // 3 days ago
    { desc: '1 week ago', date: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) }, // 7 days ago
];

testCases.forEach(testCase => {
    const result = formatDate(testCase.date);
    console.log(`${testCase.desc.padEnd(15)} → "${result}"`);
});

console.log('\n✅ Date formatting test complete!');
console.log('🎯 The Recent Marks Entries should now show accurate times.');
