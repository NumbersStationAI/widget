import type { Meta, StoryObj } from '@storybook/react'
import MessageSQL from 'components/chat/messages/MessageSQL'

const meta = {
  title: 'Chat/Messages/SQL',
  component: MessageSQL,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
  args: {
    sql: `
CREATE
OR REPLACE FUNCTION get_classes_for_tutor (in_tutor_id UUID) RETURNS TABLE (
  id BIGINT,
  subject_id BIGINT,
  student_id UUID,
  tutor_id UUID,
  rate REAL,
  class_name TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT c.id, c.subject_id, c.student_id, c.tutor_id, c.rate,
           st.last_name || ' - ' || t.last_name || ' - ' || s.name AS class_name
    FROM classes c
    JOIN subjects s ON c.subject_id = s.id
    JOIN students st ON c.student_id = st.id
    JOIN tutors t ON c.tutor_id = t.id
    WHERE c.tutor_id = in_tutor_id;
END; 
$$ LANGUAGE plpgsql;
`,
  },
} satisfies Meta<typeof MessageSQL>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {},
}
