import { Box, Checkbox, FormControlLabel, FormGroup, FormLabel, Radio, RadioGroup } from '@mui/material';

type Props = {
  filter: string;
  includeRecruiting: boolean;
  includeRecruitFailed: boolean;
  includeExecuting: boolean;
  includeCompleted: boolean;
  onChange: (
    filter: string,
    includeRecruiting: boolean,
    includeRecruitFailed: boolean,
    includeExecuting: boolean,
    includeCompleted: boolean,
  ) => void;
};

export function BattleFilter({
  filter,
  includeRecruiting,
  includeRecruitFailed,
  includeExecuting,
  includeCompleted,
  onChange,
}: Props) {
  const FilterRadioGroup = () => {
    return (
      <>
        <FormLabel id="filter-label" sx={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
          Filters
        </FormLabel>
        <RadioGroup
          aria-labelledby="filter-label"
          value={filter}
          name="filter-buttons-group"
          onChange={(e) =>
            onChange(e.target.value, includeRecruiting, includeRecruitFailed, includeExecuting, includeCompleted)
          }>
          <FormControlLabel
            sx={{ margin: '-5px 0', '& .MuiFormControlLabel-label': { fontSize: '0.9rem' } }}
            value="All"
            control={<Radio size="small" />}
            label="All"
          />
          <FormControlLabel
            sx={{ margin: '-5px 0', '& .MuiFormControlLabel-label': { fontSize: '0.9rem' } }}
            value="Created"
            control={<Radio size="small" />}
            label="Hosted"
          />
          <FormControlLabel
            sx={{ margin: '-5px 0', '& .MuiFormControlLabel-label': { fontSize: '0.9rem' } }}
            value="Joined"
            control={<Radio size="small" />}
            label="Joined"
          />
          <FormControlLabel
            sx={{ margin: '-5px 0', '& .MuiFormControlLabel-label': { fontSize: '0.9rem' } }}
            value="Sponsored"
            control={<Radio size="small" />}
            label="Sponsored"
          />
        </RadioGroup>
      </>
    );
  };

  const StatusCheckBox = () => {
    return (
      <>
        <FormLabel id="status-label" sx={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
          Status
        </FormLabel>

        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={includeRecruiting}
                onChange={(e) =>
                  onChange(filter, e.target.checked, includeRecruitFailed, includeExecuting, includeCompleted)
                }
              />
            }
            label="Recruiting"
          />

          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={includeExecuting}
                onChange={(e) =>
                  onChange(filter, includeRecruiting, includeRecruitFailed, e.target.checked, includeCompleted)
                }
              />
            }
            label="Executing"
          />

          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={includeCompleted}
                onChange={(e) =>
                  onChange(filter, includeRecruiting, includeRecruitFailed, includeExecuting, e.target.checked)
                }
              />
            }
            label="Completed"
          />

          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={includeRecruitFailed}
                onChange={(e) =>
                  onChange(filter, includeRecruiting, e.target.checked, includeExecuting, includeCompleted)
                }
              />
            }
            label="Recruit Failed"
          />
        </FormGroup>
      </>
    );
  };

  return (
    <Box sx={{ padding: '1rem', bgcolor: '#0002', borderRadius: '1rem' }}>
      <FilterRadioGroup />
      <Box sx={{ height: '0.5rem' }} />
      <StatusCheckBox />
    </Box>
  );
}
