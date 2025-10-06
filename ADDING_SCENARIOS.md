# Adding New Scenarios to VirtualSnap

This guide explains how to add new photo scenarios to VirtualSnap.

## Quick Start

1. Open `src/prompts/scenarios.json`
2. Add your new scenario to the `scenarios` array
3. The app will automatically detect and display the new scenario

## Scenario Structure

Each scenario object must have the following properties:

```json
{
  "id": "unique_scenario_id",
  "name": "Display Name",
  "description": "Brief description of the scenario",
  "icon": "🎭",
  "analysisPrompt": "Prompt for analyzing uploaded images...",
  "mainPrompt": "Main prompt for generating the final image..."
}
```

### Property Details

- **id**: Unique identifier (lowercase, underscores allowed)
- **name**: Display name shown in the UI
- **description**: Brief description shown under the name
- **icon**: Emoji icon displayed with the scenario
- **analysisPrompt**: Prompt used to analyze the uploaded images
- **mainPrompt**: Main prompt used for image generation

### Template Variables

In the `mainPrompt`, you can use these template variables:
- `{analysis1}` - Analysis result from the first uploaded image
- `{analysis2}` - Analysis result from the second uploaded image

## Example: Adding a "Concert" Scenario

```json
{
  "id": "concert_performance",
  "name": "Concert Performance",
  "description": "Create an exciting concert stage performance",
  "icon": "🎤",
  "analysisPrompt": "Describe only the clothing and accessories worn by the person in this image. Be concise and specific. Example: 'a person wearing a blue jacket, red top, and glasses'. Do NOT describe their face, hair, body, or the background.",
  "mainPrompt": "Create one high-resolution photorealistic image using the two uploaded models.\n\nImportant:\n- Use ONLY the face, hairstyle, clothing, and accessories from the uploaded images.\n- IGNORE all original body poses, postures, angles, and backgrounds from the uploaded photos.\n- The bodies and poses must follow this prompt description strictly.\n\nScene & Environment:\n- Large concert stage with bright stage lighting and effects.\n- Crowd of excited fans in the background (blurred).\n- Professional stage setup with microphones and equipment.\n- Dynamic concert lighting with colorful stage lights.\n\nPositions:\n- Model 1 ({analysis1}): Standing center stage with microphone, performing energetically, one hand holding mic close to mouth.\n- Model 2 ({analysis2}): Standing slightly behind and to the side, also performing, both hands free in expressive gesture.\n\nCamera framing:\n- Wide shot capturing both performers on stage.\n- Angle that shows the stage setup and crowd atmosphere.\n- Dynamic concert photography style.\n\nFaces & Clothing:\n- Preserve each model's original face exactly as uploaded. No swaps, no blending, no reinterpretation.\n- Keep all original clothing and accessories exactly as uploaded.\n\nOutput:\n- A single, coherent, realistic concert performance scene with both models.\n- Both faces visible, dramatically lit by stage lighting.\n- Bodies and poses must follow the new scene description, not the original images.\n- Exciting concert atmosphere.\n\nNegative constraints:\n- No double backgrounds.\n- No mismatched or merged scenes.\n- No duplicate bodies or heads.\n- No face swap.\n- No unnatural lighting from original photos.\n- No copying of original body posture from the uploaded photos."
}
```

## Best Practices

1. **Keep descriptions concise** - Users should quickly understand the scenario
2. **Use clear icons** - Choose emojis that represent the scenario well
3. **Consistent analysis prompts** - Usually focus on clothing and accessories
4. **Detailed main prompts** - Include specific positioning, lighting, and environment details
5. **Test thoroughly** - Try your scenario with different types of images

## File Location

The scenarios file is located at: `src/prompts/scenarios.json`

After adding a new scenario, the app will automatically:
- Display it in the scenario selector
- Use the appropriate prompts for analysis and generation
- Update the generate button text to match the scenario

No code changes are required - just update the JSON file!