# Machine Learning - Hand Assessment

This folder contains the machine-learning work for Sinhala sign-language hand assessment.

## Initial Scope

The first version will support 10–12 Sinhala letters.

## Models

### Model 1: Pose Verification Model

Checks whether the learner performs the selected sign correctly.

Output:

- Correct
- Wrong

### Model 2: Error Classification Model

Identifies the possible error when the sign is wrong.

Output:

- Wrong thumb
- Wrong index finger
- Wrong wrist
- Wrong hand shape
- Other error

## Data

Raw videos and private participant data are not stored in this repository.

## Process

1. Extract hand landmarks from videos.
2. Prepare the dataset.
3. Train the verification model.
4. Train the error-classification model.
5. Test the models.
6. Provide feedback to the learner.
