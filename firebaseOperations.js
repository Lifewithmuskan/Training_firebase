import { collectionGroup, query, where, getDocs } from 'firebase/firestore';

async function fetchScoreDetails(testId, email) {
    try {
        const submissionsQuery = query(
            collectionGroup(db, 'test_submissions'),
            where('testId', '==', testId),
            where('email', '==', email) // Additional filter if needed
        );

        const querySnapshot = await getDocs(submissionsQuery);

        if (querySnapshot.empty) {
            throw new Error('No submissions found');
        }

        // Assuming there is only one submission per testId and email
        const submissionData = querySnapshot.docs[0].data();

        return submissionData;
    } catch (error) {
        console.error('Error fetching score details:', error);
        throw error;
    }
}
