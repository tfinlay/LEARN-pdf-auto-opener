import React, { useCallback, useState } from 'react'
import {
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  Snackbar,
  Typography
} from '@material-ui/core'
import { Skeleton } from '@material-ui/lab'
import { observer, useLocalObservable, useLocalStore } from 'mobx-react-lite'
import { SettingsStore } from './SettingsStore'

export const Settings = observer(() => {
  const store = useLocalObservable<SettingsStore>(() => new SettingsStore())

  const setEmbeddedCallback = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    await store.setExpandEmbedded(event.target.checked)
  }, [store])

  const setOpenForcedDownloads = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    await store.setOpenForcedDownloads(event.target.checked)
  }, [store])

  const handleSnackbarClose = useCallback((event: React.SyntheticEvent | React.MouseEvent, reason?: string) => {
    store.resetHasMadeSettingsChanges()
  }, [store])

  return (
        <>
            <Card variant="outlined">
                <CardContent>
                    <Typography variant="h5">Settings</Typography>
                    <SettingsRow title="Expand embedded PDFs" onChange={setEmbeddedCallback} value={store.expandEmbedded}/>
                    <SettingsRow title="Open PDFs instead of downloading" onChange={setOpenForcedDownloads} value={store.openForcedDownloads}/>
                    <Typography variant="body2">The analytics setting has been removed as analytics are no longer collected.</Typography>
                </CardContent>
            </Card>

            <Snackbar
                open={store.hasMadeSettingsChanges}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'center'
                }}
                onClose={handleSnackbarClose}
                autoHideDuration={6000}
                message={
                    <Typography variant="body1">
                        Changes saved. Please note that it may take take a few seconds for these changes to process.
                    </Typography>
                }
            />
        </>
  )
})

interface SettingsRowProps {
    title: React.ReactNode
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
    value: boolean | undefined
}
const SettingsRow = ({ title, onChange, value }: SettingsRowProps) => {
  const content = (
        <Typography variant="body1">
            <FormControlLabel
                control={(
                    <Checkbox
                        checked={value}
                        onChange={onChange}
                        name={`${title.toString()}`}
                    />
                )}
                label={title}
            />
        </Typography>
  )

  if (value === undefined) {
    return <Skeleton title={`Loading ${title} setting...`}>content</Skeleton>
  } else {
    return content
  }
}
