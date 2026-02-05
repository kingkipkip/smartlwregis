-- Create a new type and swap it to update the enum for grade_type
-- This is the safest way to "update" an enum in Postgres without dropping dependent columns completely.

-- 1. Create temporary type
CREATE TYPE grade_type_new AS ENUM ('4', '3.5', '3', '2.5', '2', '1.5', '1', '0', 'ร', 'มส', 'ขส', 'ผ', 'มผ');

-- 2. Update the columns that use it (casting current values to the new type)
-- Note: 'A' -> '4', 'B+' -> '3.5', etc. would be logical but for now let's just allow the new values.
-- If we want to migrate existing data, we'd add mapping logic here. 
-- Since it's a new project, we can mostly start fresh or map common ones.

ALTER TABLE requests ALTER COLUMN grade_old TYPE grade_type_new USING (
    CASE 
        WHEN grade_old::text = 'A' THEN '4'::grade_type_new
        WHEN grade_old::text = 'B+' THEN '3.5'::grade_type_new
        WHEN grade_old::text = 'B' THEN '3'::grade_type_new
        WHEN grade_old::text = 'C+' THEN '2.5'::grade_type_new
        WHEN grade_old::text = 'C' THEN '2'::grade_type_new
        WHEN grade_old::text = 'D+' THEN '1.5'::grade_type_new
        WHEN grade_old::text = 'D' THEN '1'::grade_type_new
        WHEN grade_old::text = 'F' THEN '0'::grade_type_new
        ELSE grade_old::text::grade_type_new
    END
);

ALTER TABLE requests ALTER COLUMN grade_new TYPE grade_type_new USING (
    CASE 
        WHEN grade_new::text = 'A' THEN '4'::grade_type_new
        WHEN grade_new::text = 'B+' THEN '3.5'::grade_type_new
        WHEN grade_new::text = 'B' THEN '3'::grade_type_new
        WHEN grade_new::text = 'C+' THEN '2.5'::grade_type_new
        WHEN grade_new::text = 'C' THEN '2'::grade_type_new
        WHEN grade_new::text = 'D+' THEN '1.5'::grade_type_new
        WHEN grade_new::text = 'D' THEN '1'::grade_type_new
        WHEN grade_new::text = 'F' THEN '0'::grade_type_new
        ELSE grade_new::text::grade_type_new
    END
);

-- 3. Drop old type and rename new one
DROP TYPE grade_type;
ALTER TYPE grade_type_new RENAME TO grade_type;
