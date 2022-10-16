import React, { useCallback, useState } from 'react'
import { Button, Card, CardContent, Link, Snackbar, Typography } from '@material-ui/core'
import { FEEDBACK_URL, SHARE_URL } from '../constant'

interface ShareState {
    hasShared: boolean,
}
export const Share = () => {
  const [state, setState] = useState<ShareState>({
    hasShared: false
  })

  const onFeedbackClick = useCallback(() => {
    window.open(FEEDBACK_URL, '_blank')
  }, [])

  const onShareClick = useCallback(() => {
    navigator.clipboard.writeText(SHARE_URL)

    setState({
      ...state,
      hasShared: true
    })
  }, [state, setState])

  const handleSnackbarClose = useCallback((event: React.SyntheticEvent | React.MouseEvent, reason?: string) => {
    setState({
      ...state,
      hasShared: false
    })
  }, [state, setState])

  return (
        <>
            <Card variant="outlined">
                <CardContent>
                    <Typography variant="h5">Share & Feedback</Typography>

                    <Typography variant="body1">
                        Like this? Spread the word!
                        <Button onClick={onShareClick} variant="contained" color="primary" style={{ marginLeft: 8, verticalAlign: 'middle' }}>Copy download link</Button>
                    </Typography>
                    <Typography variant="body1" style={{ paddingTop: 8 }}>
                        Got any feedback?
                        <Link onClick={onFeedbackClick} color="secondary" style={{ marginLeft: 8, verticalAlign: 'middle', cursor: 'pointer' }}>Let me know!</Link>
                    </Typography>
                </CardContent>
            </Card>

            <Snackbar
                open={state.hasShared}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'center'
                }}
                onClose={handleSnackbarClose}
                autoHideDuration={6000}
                message={
                    <Typography variant="body1">
                        Thanks for sharing!
                    </Typography>
                }
            />
        </>
  )
}
