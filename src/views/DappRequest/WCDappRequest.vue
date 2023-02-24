<template>
    <div class="wrapper">
        <div class="wrapper_top form">
            <div v-if="error" class="mt-4 text-danger"><strong>Error:</strong> {{ error }}</div>

            <div v-else class="wrapper_top form">
                <div class="form-group">
                    <label>To</label>
                    <p class="confirm-value">{{ request }}</p>
                </div>
                <div class="form-group">
                    <label>Data</label>
                </div>
                <div class="permission-send_data">
                    <div class="permission-send_data_code">
                        {{ data }}
                    </div>
                </div>
            </div>

        </div>

        <div class="wrapper_bottom">
            <div class="button-group">
                <button class="btn btn-light btn-outline-primary btn-lg" @click="reject">
                    {{ $t('common.cancel') }}
                </button>
                <button class="btn btn-primary btn-lg btn-icon" @click.stop="approve" :disabled="loading">
                    <SpinnerIcon class="btn-loading" v-if="loading" />
                    <template v-else>{{ $t('common.confirm') }}</template>
                </button>
            </div>
        </div>
    </div>
</template>
  
<script>
import { mapState, mapActions } from 'vuex'
import SpinnerIcon from '@/assets/icons/spinner.svg'

export default {
    components: {
        SpinnerIcon
    },
    data() {
        return {
            error: null,
            loading: false
        }
    },
    methods: {
        ...mapActions('app', ['respondSessionRequest']),
        confirm() {

        },
        reject() {

        }
    },
    computed: {
        ...mapState('app', ['wcSessionRequests']),
        request() {
            return null
        }
    }
}
</script>
<style lang="scss" scoped></style>
  